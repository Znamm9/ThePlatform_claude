'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import QuizForm from '@/components/quizzes/quiz-form';
import QuizList from '@/components/quizzes/quiz-list';

export default function QuizzesPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lesson, setLesson] = useState<any>(null);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const [quizzesRes, lessonRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/lesson/${params.lessonId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${params.lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setQuizzes(quizzesRes.data);
      setLesson(lessonRes.data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [params.lessonId]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchQuizzes();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 mb-4 flex items-center gap-2"
        >
          <span>&larr;</span> Back to Lessons
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Quizzes: {lesson?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage quizzes for this lesson
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + New Quiz
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg border dark:border-gray-700 border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Quiz</h2>
          <QuizForm
            lessonId={params.lessonId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <QuizList quizzes={quizzes} onDelete={fetchQuizzes} />
      )}
    </div>
  );
}
