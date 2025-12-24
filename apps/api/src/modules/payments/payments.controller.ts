import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all payments' })
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Post('create-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for course purchase' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Course is free or already enrolled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  createPaymentIntent(@Body() createDto: CreatePaymentIntentDto, @Request() req) {
    return this.paymentsService.createPaymentIntent(createDto.courseId, req.user.userId);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment and create enrollment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and enrollment created' })
  @ApiResponse({ status: 400, description: 'Payment not successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  confirmPayment(@Body() confirmDto: ConfirmPaymentDto, @Request() req) {
    return this.paymentsService.confirmPayment(confirmDto.paymentIntentId, req.user.userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const payload = request.rawBody;
    return this.paymentsService.handleWebhook(signature, payload);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history for current user' })
  @ApiResponse({ status: 200, description: 'Returns payment history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserPayments(@Request() req) {
    return this.paymentsService.getUserPayments(req.user.userId);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue statistics for instructor' })
  @ApiResponse({ status: 200, description: 'Returns revenue statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor/Admin only' })
  getInstructorRevenue(@Request() req) {
    return this.paymentsService.getInstructorRevenue(req.user.userId);
  }
}
