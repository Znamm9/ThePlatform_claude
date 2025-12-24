import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizGradingService } from './quiz-grading.service';

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    private gradingService: QuizGradingService,
  ) {}

  /**
   * Create a new quiz with optional questions
   */
  async create(createQuizDto: CreateQuizDto, instructorId: string) {
    // Verify that the lesson exists and belongs to the instructor's course
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createQuizDto.lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to create quizzes for this lesson');
    }

    // Get the next sort order
    const lastQuiz = await this.prisma.quiz.findFirst({
      where: { lessonId: createQuizDto.lessonId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = createQuizDto.sortOrder ?? (lastQuiz?.sortOrder ?? -1) + 1;

    // Create quiz with questions if provided
    const quiz = await this.prisma.quiz.create({
      data: {
        lessonId: createQuizDto.lessonId,
        title: createQuizDto.title,
        description: createQuizDto.description,
        passingScore: createQuizDto.passingScore ?? 70,
        timeLimitMinutes: createQuizDto.timeLimitMinutes,
        sortOrder,
        questions: createQuizDto.questions
          ? {
              create: createQuizDto.questions.map((q, index) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                points: q.points ?? 1,
                sortOrder: q.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: { questions: true },
    });

    return quiz;
  }

  /**
   * Get all quizzes for a lesson
   */
  async findAll(lessonId: string) {
    return this.prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            explanation: true,
            points: true,
            sortOrder: true,
            // Don't include correctAnswer in the list
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Get a single quiz by ID
   */
  async findOne(id: string, includeAnswers: boolean = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          include: { course: true },
        },
        questions: {
          orderBy: { sortOrder: 'asc' },
          select: includeAnswers
            ? undefined // Include all fields
            : {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                explanation: true,
                points: true,
                sortOrder: true,
                // Exclude correctAnswer for students
              },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  /**
   * Update quiz metadata (not questions)
   */
  async update(id: string, updateQuizDto: UpdateQuizDto, instructorId: string) {
    const quiz = await this.findOne(id, true);

    if (quiz.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to update this quiz');
    }

    return this.prisma.quiz.update({
      where: { id },
      data: updateQuizDto,
      include: { questions: true },
    });
  }

  /**
   * Delete a quiz
   */
  async remove(id: string, instructorId: string) {
    const quiz = await this.findOne(id, true);

    if (quiz.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to delete this quiz');
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  /**
   * Add a question to an existing quiz
   */
  async addQuestion(
    quizId: string,
    createQuestionDto: CreateQuizQuestionDto,
    instructorId: string
  ) {
    const quiz = await this.findOne(quizId, true);

    if (quiz.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to add questions to this quiz');
    }

    // Get the next sort order
    const lastQuestion = await this.prisma.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = createQuestionDto.sortOrder ?? (lastQuestion?.sortOrder ?? -1) + 1;

    return this.prisma.quizQuestion.create({
      data: {
        quizId,
        questionText: createQuestionDto.questionText,
        questionType: createQuestionDto.questionType,
        options: createQuestionDto.options || [],
        correctAnswer: createQuestionDto.correctAnswer,
        explanation: createQuestionDto.explanation,
        points: createQuestionDto.points ?? 1,
        sortOrder,
      },
    });
  }

  /**
   * Update a quiz question
   */
  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuizQuestionDto,
    instructorId: string
  ) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to update this question');
    }

    const updateData: any = { ...updateQuestionDto };
    if (updateData.options) {
      updateData.options = updateData.options;
    }

    return this.prisma.quizQuestion.update({
      where: { id: questionId },
      data: updateData,
    });
  }

  /**
   * Delete a quiz question
   */
  async removeQuestion(questionId: string, instructorId: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.lesson.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to delete this question');
    }

    return this.prisma.quizQuestion.delete({
      where: { id: questionId },
    });
  }

  /**
   * Submit a quiz attempt and get graded results
   */
  async submitQuiz(submitDto: SubmitQuizDto, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: submitDto.quizId },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Grade the quiz
    const gradingResult = this.gradingService.gradeQuiz(
      quiz.questions,
      submitDto.answers
    );

    const passed = gradingResult.score >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: submitDto.quizId,
        score: gradingResult.score,
        passed,
        startedAt: new Date(),
        completedAt: new Date(),
        answers: {
          create: gradingResult.results.map(result => ({
            questionId: result.questionId,
            userAnswer: result.userAnswer,
            isCorrect: result.isCorrect,
            pointsEarned: result.pointsEarned,
          })),
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
    });

    return {
      ...attempt,
      totalPoints: gradingResult.totalPoints,
      earnedPoints: gradingResult.earnedPoints,
    };
  }

  /**
   * Get all attempts for a quiz by a user
   */
  async getAttempts(quizId: string, userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  /**
   * Get a specific attempt by ID
   */
  async getAttempt(attemptId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: { course: true },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this attempt');
    }

    return attempt;
  }

  /**
   * Get all quiz attempts by a user
   */
  async getUserAttempts(userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }
}
