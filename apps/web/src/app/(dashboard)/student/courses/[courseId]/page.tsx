'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import LessonViewer from '@/components/lessons/lesson-viewer';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  sortOrder: number;
  videos: any[];
  exercises: any[];
  quizzes: any[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor: {
    name: string;
  };
  category: {
    name: string;
  };
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  progressPercentage: number;
  enrolledAt: string;
  course: Course;
}

export default function StudentCourseViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollment();
  }, [params.courseId]);

  useEffect(() => {
    if (enrollment && enrollment.course.lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(enrollment.course.lessons[0]);
    }
  }, [enrollment]);

  const fetchEnrollment = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check enrollment status
      const statusResponse = await apiClient.get('/enrollments/status', {
        params: { courseId: params.courseId },
      });

      if (!statusResponse.data.isEnrolled) {
        setError('You are not enrolled in this course');
        setLoading(false);
        return;
      }

      // Get full enrollment details
      const enrollmentResponse = await apiClient.get(
        `/enrollments/${statusResponse.data.enrollment.id}`
      );
      setEnrollment(enrollmentResponse.data);
    } catch (err: any) {
      console.error('Error fetching enrollment:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleNextLesson = () => {
    if (!enrollment || !selectedLesson) return;

    const currentIndex = enrollment.course.lessons.findIndex(
      (l) => l.id === selectedLesson.id
    );

    if (currentIndex < enrollment.course.lessons.length - 1) {
      setSelectedLesson(enrollment.course.lessons[currentIndex + 1]);
    }
  };

  const handlePreviousLesson = () => {
    if (!enrollment || !selectedLesson) return;

    const currentIndex = enrollment.course.lessons.findIndex(
      (l) => l.id === selectedLesson.id
    );

    if (currentIndex > 0) {
      setSelectedLesson(enrollment.course.lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 bg-red-50 border dark:border-gray-700 border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="text-center">
              <Button onClick={() => router.push('/student/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enrollment) return null;

  const currentLessonIndex = selectedLesson
    ? enrollment.course.lessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === enrollment.course.lessons.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {enrollment.course.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {enrollment.course.instructor.name} • {enrollment.course.category.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${enrollment.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {enrollment.progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card hover={false}>
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrollment.course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 dark:border-primary-400'
                          : 'bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.videos.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                📹 {lesson.videos.length}
                              </span>
                            )}
                            {lesson.exercises.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                💻 {lesson.exercises.length}
                              </span>
                            )}
                            {lesson.quizzes.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                📝 {lesson.quizzes.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <div className="space-y-6">
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle>{selectedLesson.title}</CardTitle>
                    {selectedLesson.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedLesson.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <LessonViewer
                      lessonId={selectedLesson.id}
                      lessonContent={selectedLesson.description}
                      videos={selectedLesson.videos}
                      exercises={selectedLesson.exercises}
                      quizzes={selectedLesson.quizzes}
                    />
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePreviousLesson}
                    disabled={isFirstLesson}
                    variant="outline"
                  >
                    ← Previous Lesson
                  </Button>
                  <Button
                    onClick={handleNextLesson}
                    disabled={isLastLesson}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Next Lesson →
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">
                    Select a lesson from the sidebar to begin learning
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
