import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { CodeExecutionService } from './code-execution.service';

@Injectable()
export class ExercisesService {
  constructor(
    private prisma: PrismaService,
    private codeExecutionService: CodeExecutionService,
  ) {}

  async create(createExerciseDto: CreateExerciseDto, instructorId: string) {
    // Verify that the lesson exists and belongs to the instructor's course
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createExerciseDto.lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to create exercises for this lesson');
    }

    // Get the next sort order
    const lastExercise = await this.prisma.exercise.findFirst({
      where: { lessonId: createExerciseDto.lessonId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = createExerciseDto.sortOrder ?? (lastExercise?.sortOrder ?? -1) + 1;

    return this.prisma.exercise.create({
      data: {
        lessonId: createExerciseDto.lessonId,
        title: createExerciseDto.title,
        description: createExerciseDto.description,
        instructions: createExerciseDto.instructions,
        starterCode: createExerciseDto.starterCode,
        solutionCode: createExerciseDto.solutionCode,
        testCases: (createExerciseDto.testCases || []) as any,
        difficulty: createExerciseDto.difficulty,
        points: createExerciseDto.points ?? 10,
        sortOrder,
      },
    });
  }

  async findAll(lessonId: string) {
    return this.prisma.exercise.findMany({
      where: { lessonId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto, instructorId: string) {
    const exercise = await this.findOne(id);

    if (exercise.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to update this exercise');
    }

    const updateData: any = { ...updateExerciseDto };
    if (updateData.testCases) {
      updateData.testCases = updateData.testCases as any;
    }

    return this.prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, instructorId: string) {
    const exercise = await this.findOne(id);

    if (exercise.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to delete this exercise');
    }

    return this.prisma.exercise.delete({
      where: { id },
    });
  }

  async submitExercise(submitDto: SubmitExerciseDto, userId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: submitDto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Execute the code against test cases
    let executionResult = null;
    let isCorrect = false;
    let pointsEarned = 0;

    if (exercise.testCases && Array.isArray(exercise.testCases) && exercise.testCases.length > 0) {
      executionResult = await this.codeExecutionService.executeCode(
        submitDto.submittedCode,
        exercise.testCases as any[],
      );

      isCorrect = executionResult.allTestsPassed;
      pointsEarned = isCorrect ? exercise.points : 0;
    }

    // Create submission record
    const submission = await this.prisma.exerciseSubmission.create({
      data: {
        userId,
        exerciseId: submitDto.exerciseId,
        submittedCode: submitDto.submittedCode,
        isCorrect,
        testResults: executionResult,
        pointsEarned,
      },
    });

    return submission;
  }

  async getSubmissions(exerciseId: string, userId: string) {
    return this.prisma.exerciseSubmission.findMany({
      where: {
        exerciseId,
        userId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async getUserSubmissions(userId: string) {
    return this.prisma.exerciseSubmission.findMany({
      where: { userId },
      include: {
        exercise: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }
}
