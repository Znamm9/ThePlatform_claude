import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async createEnrollment(userId: string, dto: CreateEnrollmentDto) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      include: {
        instructor: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is published
    if (!course.isPublished) {
      throw new BadRequestException('Cannot enroll in unpublished course');
    }

    // Check if course is premium (should use payment flow)
    if (course.isPremium && course.priceCents > 0) {
      throw new BadRequestException(
        'This is a premium course. Please use the payment flow to enroll',
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId: dto.courseId,
        progressPercentage: 0,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: true,
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    return enrollment;
  }

  async getEnrollmentStatus(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return {
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
    };
  }

  async getMyEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: true,
            _count: {
              select: {
                lessons: true,
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments;
  }

  async getEnrollmentById(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            lessons: {
              orderBy: {
                sortOrder: 'asc',
              },
              include: {
                videos: true,
                exercises: true,
                quizzes: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if user owns this enrollment
    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    return enrollment;
  }

  async deleteEnrollment(enrollmentId: string, userId: string) {
    // Check if enrollment exists and user owns it
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own enrollments');
    }

    // Delete enrollment
    await this.prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return { message: 'Enrollment deleted successfully' };
  }

  async getAllEnrollments() {
    return this.prisma.enrollment.findMany({
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
        enrolledAt: 'desc',
      },
    });
  }
}
