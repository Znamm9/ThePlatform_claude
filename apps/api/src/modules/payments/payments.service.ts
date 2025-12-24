import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      console.warn('STRIPE_SECRET_KEY not configured. Payment features will not work.');
      // Create a dummy stripe instance to prevent crashes
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Create a payment intent for a course purchase
   */
  async createPaymentIntent(courseId: string, userId: string) {
    // Get course details
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPremium) {
      throw new BadRequestException('This course is free');
    }

    if (course.priceCents <= 0) {
      throw new BadRequestException('Course price not set');
    }

    // Check if user already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    // Create or get Stripe customer
    let customerId = null;

    // Check if user has existing payments with customer ID
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        stripeCustomerId: { not: null },
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (existingPayment?.stripeCustomerId) {
      customerId = existingPayment.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: course.priceCents,
      currency: 'usd',
      customer: customerId,
      metadata: {
        courseId: course.id,
        userId: user.id,
        courseName: course.title,
      },
      description: `Purchase: ${course.title}`,
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        courseId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        amountCents: course.priceCents,
        currency: 'USD',
        status: PaymentStatus.PENDING,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: course.priceCents,
      currency: 'usd',
      payment,
    };
  }

  /**
   * Confirm payment and create enrollment
   */
  async confirmPayment(paymentIntentId: string, userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    // Find payment record
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        course: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      // Payment already processed, return existing enrollment
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: payment.courseId,
          },
        },
      });

      return {
        payment,
        enrollment,
        alreadyProcessed: true,
      };
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      },
    });

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId: payment.courseId,
        progressPercentage: 0,
      },
    });

    return {
      payment,
      enrollment,
      alreadyProcessed: false,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment from webhook
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      // Already processed
      return;
    }

    // Update payment
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      },
    });

    // Create enrollment if doesn't exist
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      },
    });

    if (!existingEnrollment) {
      await this.prisma.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
          progressPercentage: 0,
        },
      });
    }
  }

  /**
   * Handle failed payment from webhook
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  }

  /**
   * Get payment history for a user
   */
  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get revenue statistics for an instructor
   */
  async getInstructorRevenue(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    const payments = await this.prisma.payment.findMany({
      where: {
        courseId: { in: courseIds },
        status: PaymentStatus.SUCCEEDED,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amountCents, 0);
    const totalSales = payments.length;

    // Group by course
    const revenueByCourse = payments.reduce((acc, payment) => {
      const courseId = payment.courseId;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseTitle: payment.course.title,
          sales: 0,
          revenue: 0,
        };
      }
      acc[courseId].sales += 1;
      acc[courseId].revenue += payment.amountCents;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalRevenue,
      totalSales,
      payments,
      revenueByCourse: Object.values(revenueByCourse),
    };
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
