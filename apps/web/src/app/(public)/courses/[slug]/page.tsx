'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [params.slug]);

  useEffect(() => {
    if (course && isAuthenticated) {
      checkEnrollmentStatus();
    }
  }, [course, isAuthenticated]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/slug/${params.slug}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!course) return;

    try {
      const response = await apiClient.get('/enrollments/status', {
        params: { courseId: course.id },
      });
      setIsEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.slug}`);
      return;
    }

    // If already enrolled, go to course viewer
    if (isEnrolled) {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    if (course.isPremium) {
      // Redirect to checkout for premium courses
      router.push(`/checkout/${course.id}`);
    } else {
      // For free courses, create enrollment directly
      try {
        setEnrolling(true);
        await apiClient.post('/enrollments', {
          courseId: course.id,
        });
        setIsEnrolled(true);
        // Redirect to course viewer
        router.push(`/student/courses/${course.id}`);
      } catch (error: any) {
        console.error('Enrollment error:', error);
        alert(error.response?.data?.message || 'Failed to enroll in course');
      } finally {
        setEnrolling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm bg-white/20 px-3 py-1 rounded">
              {course.category?.name}
            </span>
            {course.difficultyLevel && (
              <span className="text-sm bg-white/20 px-3 py-1 rounded capitalize">
                {course.difficultyLevel.toLowerCase()}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl opacity-90 mb-6">{course.shortDescription}</p>
          <div className="flex items-center gap-6 text-sm">
            <span>Instructor: {course.instructor?.name}</span>
            <span>{course.lessons?.length || 0} Lessons</span>
            <span>{course._count?.enrollments || 0} Students</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {course.lessons.map((lesson: any, index: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-gray-500">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.durationMinutes && (
                            <span className="text-sm text-gray-500">
                              {lesson.durationMinutes} min
                            </span>
                          )}
                          {lesson.isFreePreview && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No lessons available yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  {course.isPremium ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Price</p>
                      <p className="text-4xl font-bold text-primary-600">
                        ${(course.priceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-4xl font-bold text-green-600">FREE</p>
                  )}
                </div>

                <Button
                  className="w-full mb-4"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling
                    ? 'Enrolling...'
                    : isEnrolled
                    ? 'Go to Course'
                    : course.isPremium
                    ? 'Buy Now'
                    : 'Enroll for Free'}
                </Button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Lessons</span>
                    <span className="font-medium">
                      {course.lessons?.length || 0}
                    </span>
                  </div>
                  {course.estimatedDurationHours && (
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-medium">
                        {course.estimatedDurationHours} hours
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Students</span>
                    <span className="font-medium">
                      {course._count?.enrollments || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Level</span>
                    <span className="font-medium capitalize">
                      {course.difficultyLevel?.toLowerCase() || 'All levels'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
