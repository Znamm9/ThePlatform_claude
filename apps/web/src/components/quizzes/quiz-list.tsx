'use client';

import { useState } from 'react';
import axios from 'axios';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes?: number;
  questions: any[];
  sortOrder: number;
}

interface QuizListProps {
  quizzes: Quiz[];
  onDelete: () => void;
}

export default function QuizList({ quizzes, onDelete }: QuizListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (quizId: string, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(quizId);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onDelete();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setDeleting(null);
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No quizzes yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="p-6 bg-white border rounded-lg hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="text-gray-600">
                  <strong>{quiz.questions.length}</strong> Questions
                </span>
                <span className="text-gray-600">
                  Passing Score: <strong>{quiz.passingScore}%</strong>
                </span>
                {quiz.timeLimitMinutes && (
                  <span className="text-gray-600">
                    Time Limit: <strong>{quiz.timeLimitMinutes}min</strong>
                  </span>
                )}
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-500">
                  Total Points: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleDelete(quiz.id, quiz.title)}
                disabled={deleting === quiz.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
              >
                {deleting === quiz.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Question Summary */}
          {quiz.questions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Questions:</p>
              <ul className="space-y-1">
                {quiz.questions.slice(0, 3).map((question, idx) => (
                  <li key={question.id} className="text-sm text-gray-600">
                    {idx + 1}. {question.questionText.substring(0, 60)}
                    {question.questionText.length > 60 ? '...' : ''}
                    <span className="ml-2 text-xs text-gray-500">
                      ({question.questionType})
                    </span>
                  </li>
                ))}
                {quiz.questions.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    + {quiz.questions.length - 3} more questions
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
