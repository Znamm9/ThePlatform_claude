'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface QuizAnswer {
  id: string;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
  question: {
    id: string;
    questionText: string;
    questionType: string;
    options?: string[];
    correctAnswer: any;
    explanation?: string;
    points: number;
  };
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
  };
  answers: QuizAnswer[];
  totalPoints?: number;
  earnedPoints?: number;
}

interface QuizResultsProps {
  attemptId: string;
  onRetry?: () => void;
}

export default function QuizResults({ attemptId, onRetry }: QuizResultsProps) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/attempt/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttempt(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error || 'Failed to load results'}</p>
      </div>
    );
  }

  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const totalQuestions = attempt.answers.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <div className={`border rounded-lg p-8 mb-6 ${
        attempt.passed ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            {attempt.passed ? '🎉 Congratulations!' : '📝 Quiz Complete'}
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            {attempt.passed
              ? 'You passed the quiz!'
              : `You need ${attempt.quiz.passingScore}% to pass`}
          </p>

          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${
                attempt.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {attempt.score}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Your Score</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {correctCount}/{totalQuestions}
              </div>
              <p className="text-sm text-gray-600 mt-1">Correct Answers</p>
            </div>
          </div>

          {attempt.totalPoints !== undefined && (
            <p className="text-gray-600">
              You earned <strong>{attempt.earnedPoints}/{attempt.totalPoints}</strong> points
            </p>
          )}
        </div>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className="flex justify-center mb-6">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry Quiz
          </button>
        </div>
      )}

      {/* Question Review */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Answers</h3>
      </div>

      <div className="space-y-6">
        {attempt.answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`border rounded-lg p-6 ${
              answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Question {index + 1}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({answer.question.points} point{answer.question.points !== 1 ? 's' : ''})
                </span>
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                answer.isCorrect
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}>
                {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>

            <p className="text-gray-900 mb-4">{answer.question.questionText}</p>

            {/* Multiple Choice Display */}
            {answer.question.questionType === 'MULTIPLE_CHOICE' && answer.question.options && (
              <div className="space-y-2 mb-4">
                {answer.question.options.map((option, optIdx) => {
                  const isUserAnswer = option === answer.userAnswer;
                  const isCorrectAnswer = option === answer.question.correctAnswer;

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 border rounded-lg ${
                        isCorrectAnswer
                          ? 'bg-green-100 border-green-400'
                          : isUserAnswer
                          ? 'bg-red-100 border-red-400'
                          : 'bg-white'
                      }`}
                    >
                      <span className="text-gray-900">
                        {isCorrectAnswer && '✓ '}
                        {isUserAnswer && !isCorrectAnswer && '✗ '}
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False Display */}
            {answer.question.questionType === 'TRUE_FALSE' && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Your answer:</strong> {String(answer.userAnswer)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Correct answer:</strong> {String(answer.question.correctAnswer)}
                </p>
              </div>
            )}

            {/* Code Based Display */}
            {answer.question.questionType === 'CODE_BASED' && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Your answer:</strong></p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {answer.userAnswer}
                </pre>
                <p className="text-sm text-gray-700 mt-2 mb-2"><strong>Expected answer:</strong></p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {answer.question.correctAnswer}
                </pre>
              </div>
            )}

            {/* Explanation */}
            {answer.question.explanation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                <p className="text-sm text-blue-800">{answer.question.explanation}</p>
              </div>
            )}

            <div className="mt-3 text-sm text-gray-600">
              Points earned: {answer.pointsEarned}/{answer.question.points}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 p-6 bg-gray-50 border rounded-lg text-center">
        <p className="text-gray-600">
          Completed on {new Date(attempt.completedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
