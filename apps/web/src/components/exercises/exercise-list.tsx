'use client';

import { useState } from 'react';
import axios from 'axios';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  sortOrder: number;
  testCases: any;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onDelete: () => void;
}

export default function ExerciseList({ exercises, onDelete }: ExerciseListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    setDeleting(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/exercises/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDelete();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Failed to delete exercise');
    } finally {
      setDeleting(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No exercises created yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Create your first exercise to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    exercise.difficulty
                  )}`}
                >
                  {exercise.difficulty}
                </span>
                <span className="text-sm text-gray-500">{exercise.points} points</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
              <div className="text-xs text-gray-500">
                {exercise.testCases && Array.isArray(exercise.testCases) ? (
                  <span>{exercise.testCases.length} test case(s)</span>
                ) : (
                  <span>No test cases</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(exercise.id)}
              disabled={deleting === exercise.id}
              className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 disabled:opacity-50"
            >
              {deleting === exercise.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
