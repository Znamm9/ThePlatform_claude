import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // Helper function to generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Helper to check if user can modify course
  private async canModifyCourse(
    courseId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.instructorId === userId || userRole === 'ADMIN';
  }

  async findAll(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            durationSeconds: true,
            uploadStatus: true,
          },
        },
        exercises: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            instructorId: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        videos: true,
        exercises: true,
        quizzes: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(
    courseId: string,
    userId: string,
    userRole: string,
    createLessonDto: CreateLessonDto,
  ) {
    // Check permissions
    const canModify = await this.canModifyCourse(courseId, userId, userRole);
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to add lessons to this course',
      );
    }

    const slug = this.generateSlug(createLessonDto.title);

    return this.prisma.lesson.create({
      data: {
        ...createLessonDto,
        slug,
        courseId,
      },
      include: {
        videos: true,
        exercises: true,
        quizzes: true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    updateLessonDto: UpdateLessonDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check permissions
    const canModify = await this.canModifyCourse(
      lesson.courseId,
      userId,
      userRole,
    );
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to update this lesson',
      );
    }

    const slug = updateLessonDto.title
      ? this.generateSlug(updateLessonDto.title)
      : undefined;

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...updateLessonDto,
        ...(slug && { slug }),
      },
      include: {
        videos: true,
        exercises: true,
        quizzes: true,
      },
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check permissions
    const canModify = await this.canModifyCourse(
      lesson.courseId,
      userId,
      userRole,
    );
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to delete this lesson',
      );
    }

    await this.prisma.lesson.delete({
      where: { id },
    });

    return { message: 'Lesson deleted successfully' };
  }

  async reorder(
    courseId: string,
    userId: string,
    userRole: string,
    reorderDto: ReorderLessonsDto,
  ) {
    // Check permissions
    const canModify = await this.canModifyCourse(courseId, userId, userRole);
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to reorder lessons in this course',
      );
    }

    // Update sort order for each lesson
    const updates = reorderDto.lessonIds.map((lessonId, index) =>
      this.prisma.lesson.update({
        where: { id: lessonId },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'Lessons reordered successfully' };
  }
}
