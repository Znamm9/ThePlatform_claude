import { Injectable } from '@nestjs/common';
import { QuestionType } from '@prisma/client';

interface QuizQuestion {
  id: string;
  questionType: QuestionType;
  correctAnswer: any;
  points: number;
}

interface UserAnswer {
  questionId: string;
  userAnswer: any;
}

interface GradingResult {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
  userAnswer: any;
  correctAnswer: any;
}

@Injectable()
export class QuizGradingService {
  /**
   * Grade a quiz attempt by comparing user answers with correct answers
   */
  gradeQuiz(
    questions: QuizQuestion[],
    userAnswers: UserAnswer[]
  ): { results: GradingResult[]; totalPoints: number; earnedPoints: number; score: number } {
    const results: GradingResult[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of questions) {
      totalPoints += question.points;

      const userAnswer = userAnswers.find(a => a.questionId === question.id);

      if (!userAnswer) {
        // No answer provided
        results.push({
          questionId: question.id,
          isCorrect: false,
          pointsEarned: 0,
          userAnswer: null,
          correctAnswer: question.correctAnswer,
        });
        continue;
      }

      const isCorrect = this.checkAnswer(
        question.questionType,
        question.correctAnswer,
        userAnswer.userAnswer
      );

      const pointsForQuestion = isCorrect ? question.points : 0;
      earnedPoints += pointsForQuestion;

      results.push({
        questionId: question.id,
        isCorrect,
        pointsEarned: pointsForQuestion,
        userAnswer: userAnswer.userAnswer,
        correctAnswer: question.correctAnswer,
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return {
      results,
      totalPoints,
      earnedPoints,
      score,
    };
  }

  /**
   * Check if an answer is correct based on question type
   */
  private checkAnswer(
    questionType: QuestionType,
    correctAnswer: any,
    userAnswer: any
  ): boolean {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return this.normalizeString(correctAnswer) === this.normalizeString(userAnswer);

      case QuestionType.TRUE_FALSE:
        return this.normalizeBoolean(correctAnswer) === this.normalizeBoolean(userAnswer);

      case QuestionType.CODE_BASED:
        // For code-based questions, we do simple string comparison
        // In a real-world scenario, you might want to execute the code
        return this.normalizeString(correctAnswer) === this.normalizeString(userAnswer);

      default:
        return false;
    }
  }

  /**
   * Normalize string for comparison (trim, lowercase)
   */
  private normalizeString(value: any): string {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return String(value).trim().toLowerCase();
  }

  /**
   * Normalize boolean values
   */
  private normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    return Boolean(value);
  }
}
