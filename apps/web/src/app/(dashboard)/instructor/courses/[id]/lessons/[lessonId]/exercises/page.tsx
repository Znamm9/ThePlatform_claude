'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ExerciseForm from '@/components/exercises/exercise-form';
import ExerciseList from '@/components/exercises/exercise-list';

export default function ExercisesPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lesson, setLesson] = useState<any>(null);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem('token');
      const [exercisesRes, lessonRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exercises/lesson/${params.lessonId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${params.lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExercises(exercisesRes.data);
      setLesson(lessonRes.data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [params.lessonId]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchExercises();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading exercises...</p>
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
              Exercises: {lesson?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage coding exercises for this lesson
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + New Exercise
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg border dark:border-gray-700 border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Exercise</h2>
          <ExerciseForm
            lessonId={params.lessonId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <ExerciseList exercises={exercises} onDelete={fetchExercises} />
      )}
    </div>
  );
}
