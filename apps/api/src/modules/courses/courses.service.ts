import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Helper function to generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(filters?: {
    categoryId?: string;
    isPremium?: boolean;
    search?: string;
    difficultyLevel?: string;
  }) {
    const where: any = { isPublished: true };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isPremium !== undefined) {
      where.isPremium = filters.isPremium;
    }

    if (filters?.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.course.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.course.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            slug: true,
            sortOrder: true,
            durationMinutes: true,
            isFreePreview: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            sortOrder: true,
            durationMinutes: true,
            isFreePreview: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByInstructor(instructorId: string) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(instructorId: string, createCourseDto: CreateCourseDto) {
    const slug = this.generateSlug(createCourseDto.title);

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        slug,
        instructorId,
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only course instructor or admin can update
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to update this course',
      );
    }

    const slug = updateCourseDto.title
      ? this.generateSlug(updateCourseDto.title)
      : undefined;

    return this.prisma.course.update({
      where: { id },
      data: {
        ...updateCourseDto,
        ...(slug && { slug }),
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only course instructor or admin can delete
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this course',
      );
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: 'Course deleted successfully' };
  }

  async publish(id: string, userId: string, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only course instructor or admin can publish
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to publish this course',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string, userId: string, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only course instructor or admin can unpublish
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to unpublish this course',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });
  }
}
