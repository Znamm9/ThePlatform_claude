'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        apiClient.get(`/courses/${params.id}`),
        apiClient.get(`/lessons/course/${params.id}`),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await apiClient.delete(`/lessons/${lessonId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleReorder = async (dragIndex: number, hoverIndex: number) => {
    const newLessons = [...lessons];
    const [draggedLesson] = newLessons.splice(dragIndex, 1);
    newLessons.splice(hoverIndex, 0, draggedLesson);

    // Optimistic update
    setLessons(newLessons);

    try {
      const lessonIds = newLessons.map((lesson: any) => lesson.id);
      await apiClient.post(`/lessons/course/${params.id}/reorder`, {
        lessonIds,
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      // Revert on error
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {course?.title} - Lessons
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage course lessons and content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Courses
          </Button>
          <Link href={`/instructor/courses/${params.id}/analytics`}>
            <Button variant="outline">Analytics</Button>
          </Link>
          <Link href={`/instructor/courses/${params.id}/lessons/new`}>
            <Button>Add New Lesson</Button>
          </Link>
        </div>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No lessons created yet</p>
            <Link href={`/instructor/courses/${params.id}/lessons/new`}>
              <Button>Create First Lesson</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Course Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => index > 0 && handleReorder(index, index - 1)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() =>
                          index < lessons.length - 1 &&
                          handleReorder(index, index + 1)
                        }
                        disabled={index === lessons.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        {lesson.durationMinutes && (
                          <span>{lesson.durationMinutes} min</span>
                        )}
                        <span>{lesson.videos?.length || 0} videos</span>
                        <span>{lesson.exercises?.length || 0} exercises</span>
                        <span>{lesson.quizzes?.length || 0} quizzes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {lesson.isFreePreview && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Preview
                      </span>
                    )}
                    <Link
                      href={`/instructor/courses/${params.id}/lessons/${lesson.id}/videos`}
                    >
                      <Button variant="outline" size="sm">
                        Videos
                      </Button>
                    </Link>
                    <Link
                      href={`/instructor/courses/${params.id}/lessons/${lesson.id}/exercises`}
                    >
                      <Button variant="outline" size="sm">
                        Exercises
                      </Button>
                    </Link>
                    <Link
                      href={`/instructor/courses/${params.id}/lessons/${lesson.id}/quizzes`}
                    >
                      <Button variant="outline" size="sm">
                        Quizzes
                      </Button>
                    </Link>
                    <Link
                      href={`/instructor/courses/${params.id}/lessons/${lesson.id}/edit`}
                    >
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(lesson.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
