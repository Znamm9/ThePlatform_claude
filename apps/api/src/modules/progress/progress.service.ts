import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface LessonProgressData {
  lessonId: string;
  lessonTitle: string;
  isCompleted: boolean;
  videosWatched: number;
  totalVideos: number;
  exercisesCompleted: number;
  totalExercises: number;
  quizzesPassed: number;
  totalQuizzes: number;
  progressPercentage: number;
}

export interface CourseProgressData {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalVideos: number;
  watchedVideos: number;
  totalExercises: number;
  completedExercises: number;
  totalQuizzes: number;
  passedQuizzes: number;
  overallProgress: number;
  lessons: LessonProgressData[];
}

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate overall progress for a course
   */
  async getCourseProgress(courseId: string, userId: string): Promise<CourseProgressData> {
    // Fetch course with all lessons and their content
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          include: {
            videos: true,
            exercises: true,
            quizzes: {
              include: {
                questions: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Fetch user's progress data
    const [lessonProgress, videoProgress, exerciseSubmissions, quizAttempts] = await Promise.all([
      this.prisma.lessonProgress.findMany({
        where: {
          userId,
          lesson: { courseId },
        },
      }),
      this.prisma.videoProgress.findMany({
        where: {
          userId,
          video: {
            lesson: { courseId },
          },
        },
      }),
      this.prisma.exerciseSubmission.findMany({
        where: {
          userId,
          exercise: {
            lesson: { courseId },
          },
        },
      }),
      this.prisma.quizAttempt.findMany({
        where: {
          userId,
          quiz: {
            lesson: { courseId },
          },
        },
      }),
    ]);

    // Calculate progress for each lesson
    const lessonsProgress: LessonProgressData[] = course.lessons.map((lesson) => {
      const lessonProgressRecord = lessonProgress.find((lp) => lp.lessonId === lesson.id);

      // Videos progress
      const lessonVideos = lesson.videos.filter(v => v.uploadStatus === 'READY');
      const watchedVideos = lessonVideos.filter((video) =>
        videoProgress.some((vp) => vp.videoId === video.id && vp.isCompleted)
      ).length;

      // Exercises progress
      const completedExercises = lesson.exercises.filter((exercise) =>
        exerciseSubmissions.some((es) => es.exerciseId === exercise.id && es.isCorrect)
      ).length;

      // Quizzes progress
      const passedQuizzes = lesson.quizzes.filter((quiz) =>
        quizAttempts.some((qa) => qa.quizId === quiz.id && qa.passed)
      ).length;

      // Calculate lesson progress percentage
      const totalItems = lessonVideos.length + lesson.exercises.length + lesson.quizzes.length;
      const completedItems = watchedVideos + completedExercises + passedQuizzes;
      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        isCompleted: lessonProgressRecord?.isCompleted || progressPercentage === 100,
        videosWatched: watchedVideos,
        totalVideos: lessonVideos.length,
        exercisesCompleted: completedExercises,
        totalExercises: lesson.exercises.length,
        quizzesPassed: passedQuizzes,
        totalQuizzes: lesson.quizzes.length,
        progressPercentage,
      };
    });

    // Calculate overall course progress
    const totalLessons = course.lessons.length;
    const completedLessons = lessonsProgress.filter((lp) => lp.isCompleted).length;

    const totalVideos = lessonsProgress.reduce((sum, lp) => sum + lp.totalVideos, 0);
    const watchedVideos = lessonsProgress.reduce((sum, lp) => sum + lp.videosWatched, 0);

    const totalExercises = lessonsProgress.reduce((sum, lp) => sum + lp.totalExercises, 0);
    const completedExercises = lessonsProgress.reduce((sum, lp) => sum + lp.exercisesCompleted, 0);

    const totalQuizzes = lessonsProgress.reduce((sum, lp) => sum + lp.totalQuizzes, 0);
    const passedQuizzes = lessonsProgress.reduce((sum, lp) => sum + lp.quizzesPassed, 0);

    const totalItems = totalVideos + totalExercises + totalQuizzes;
    const completedItems = watchedVideos + completedExercises + passedQuizzes;
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      totalVideos,
      watchedVideos,
      totalExercises,
      completedExercises,
      totalQuizzes,
      passedQuizzes,
      overallProgress,
      lessons: lessonsProgress,
    };
  }

  /**
   * Mark a lesson as completed
   */
  async markLessonComplete(lessonId: string, userId: string) {
    // Check if progress record exists
    const existing = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (existing) {
      return this.prisma.lessonProgress.update({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    } else {
      return this.prisma.lessonProgress.create({
        data: {
          userId,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Update enrollment progress percentage
   */
  async updateEnrollmentProgress(courseId: string, userId: string) {
    const progressData = await this.getCourseProgress(courseId, userId);

    // Check if enrollment exists
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      // Create enrollment if it doesn't exist
      await this.prisma.enrollment.create({
        data: {
          userId,
          courseId,
          progressPercentage: progressData.overallProgress,
          completedAt: progressData.overallProgress === 100 ? new Date() : null,
        },
      });
    } else {
      // Update existing enrollment
      await this.prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          progressPercentage: progressData.overallProgress,
          completedAt: progressData.overallProgress === 100 ? new Date() : null,
        },
      });
    }

    return progressData;
  }

  /**
   * Get all enrollments with progress for a user
   */
  async getUserEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
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

  /**
   * Get instructor analytics for a course
   */
  async getInstructorCourseAnalytics(courseId: string, instructorId: string) {
    // Verify instructor owns the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          include: {
            exercises: true,
            quizzes: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!course || course.instructorId !== instructorId) {
      throw new Error('Course not found or unauthorized');
    }

    // Get all enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get exercise submissions for this course
    const exerciseSubmissions = await this.prisma.exerciseSubmission.findMany({
      where: {
        exercise: {
          lesson: { courseId },
        },
      },
    });

    // Get quiz attempts for this course
    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        quiz: {
          lesson: { courseId },
        },
      },
      include: {
        quiz: true,
      },
    });

    // Calculate statistics
    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter((e) => e.progressPercentage > 0).length;
    const completedStudents = enrollments.filter((e) => e.progressPercentage === 100).length;
    const averageProgress =
      totalStudents > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / totalStudents
          )
        : 0;

    // Exercise statistics
    const totalExercises = course.lessons.reduce((sum, l) => sum + l.exercises.length, 0);
    const exerciseAttempts = exerciseSubmissions.length;
    const exerciseCompletions = exerciseSubmissions.filter((es) => es.isCorrect).length;
    const exerciseCompletionRate =
      exerciseAttempts > 0 ? Math.round((exerciseCompletions / exerciseAttempts) * 100) : 0;

    // Quiz statistics
    const totalQuizzes = course.lessons.reduce((sum, l) => sum + l.quizzes.length, 0);
    const quizAttemptCount = quizAttempts.length;
    const quizPasses = quizAttempts.filter((qa) => qa.passed).length;
    const quizPassRate = quizAttemptCount > 0 ? Math.round((quizPasses / quizAttemptCount) * 100) : 0;
    const averageQuizScore =
      quizAttemptCount > 0
        ? Math.round(quizAttempts.reduce((sum, qa) => sum + qa.score, 0) / quizAttemptCount)
        : 0;

    // Quiz-specific stats
    const quizStats = course.lessons.flatMap((lesson) =>
      lesson.quizzes.map((quiz) => {
        const attempts = quizAttempts.filter((qa) => qa.quizId === quiz.id);
        const passes = attempts.filter((qa) => qa.passed).length;
        const avgScore =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, qa) => sum + qa.score, 0) / attempts.length)
            : 0;

        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          lessonTitle: lesson.title,
          attempts: attempts.length,
          passes,
          passRate: attempts.length > 0 ? Math.round((passes / attempts.length) * 100) : 0,
          averageScore: avgScore,
        };
      })
    );

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalStudents,
      activeStudents,
      completedStudents,
      averageProgress,
      totalExercises,
      exerciseAttempts,
      exerciseCompletions,
      exerciseCompletionRate,
      totalQuizzes,
      quizAttemptCount,
      quizPasses,
      quizPassRate,
      averageQuizScore,
      quizStats,
      enrollments,
    };
  }
}
