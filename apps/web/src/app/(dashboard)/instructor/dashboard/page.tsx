'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CardSkeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
  isPublished: boolean;
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export default function InstructorDashboard() {
  const { showToast } = useToast();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses/instructor/my-courses');
      setCourses(response.data);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;
  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Manage your courses and track student progress.
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button variant="gradient" size="lg" className="shadow-2xl">
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {publishedCourses}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published Courses</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalEnrollments}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card className="glass-strong">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Courses</CardTitle>
            <Link href="/instructor/courses">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first course to start teaching
              </p>
              <Link href="/instructor/courses/new">
                <Button variant="gradient" size="lg" className="shadow-2xl">
                  Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  onClick={() => router.push(`/instructor/courses/${course.id}/lessons`)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{course._count?.lessons || 0} lessons</span>
                      <span>•</span>
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        course.isPublished
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/instructor/courses">
              <div className="p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-xl hover:from-primary-500/20 hover:to-primary-600/10 transition-all cursor-pointer border border-primary-200 dark:border-primary-800">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Manage Courses
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and edit all your courses
                </p>
              </div>
            </Link>

            <Link href="/instructor/courses/new">
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl hover:from-green-500/20 hover:to-green-600/10 transition-all cursor-pointer border border-green-200 dark:border-green-800">
                <div className="text-3xl mb-2">➕</div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Create Course
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start creating a new course
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
