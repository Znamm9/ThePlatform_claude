'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Enrollment {
  id: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    shortDescription?: string;
    category: {
      name: string;
    };
    instructor: {
      name: string;
    };
  };
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalVideos: number;
  watchedVideos: number;
  totalExercises: number;
  completedExercises: number;
  totalQuizzes: number;
  passedQuizzes: number;
  overallProgress: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressData, setProgressData] = useState<{ [key: string]: CourseProgress }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch enrollments
      const enrollmentsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/enrollments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrollments(enrollmentsRes.data);

      // Fetch detailed progress for first 5 active courses
      const activeCourses = enrollmentsRes.data
        .filter((e: Enrollment) => e.progressPercentage > 0 && e.progressPercentage < 100)
        .slice(0, 5);

      if (activeCourses.length > 0) {
        const progressPromises = activeCourses.map((enrollment: Enrollment) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/progress/course/${enrollment.course.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        );

        const progressResults = await Promise.all(progressPromises);
        const progressMap: { [key: string]: CourseProgress } = {};

        progressResults.forEach((result, index) => {
          const courseId = activeCourses[index].course.id;
          progressMap[courseId] = result.data;
        });

        setProgressData(progressMap);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-blue-500 to-primary-500';
    if (percentage >= 20) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="card-glass px-8 py-6">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const inProgressCourses = enrollments.filter((e) => e.progressPercentage > 0 && e.progressPercentage < 100);
  const completedCourses = enrollments.filter((e) => e.progressPercentage === 100);
  const notStartedCourses = enrollments.filter((e) => e.progressPercentage === 0);

  return (
    <div className="space-y-6 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl -z-10" />

      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-black mb-2">
          <span className="gradient-text">Welcome back, {user?.name}!</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Track your learning progress and continue your courses</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black gradient-text">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black bg-gradient-to-r from-blue-500 to-primary-500 bg-clip-text text-transparent">{inProgressCourses.length}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{completedCourses.length}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden" hover={true}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-400/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-400 dark:text-gray-500">{notStartedCourses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressCourses.slice(0, 5).map((enrollment) => {
                const progress = progressData[enrollment.course.id];
                return (
                  <div key={enrollment.id} className="p-5 glass-subtle rounded-2xl hover:glass transition-all duration-300 group border dark:border-gray-700 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">{enrollment.course.category.name}</span>
                          <span>•</span>
                          <span>{enrollment.course.instructor.name}</span>
                        </p>
                      </div>
                      <Link href={`/student/courses/${enrollment.course.id}`}>
                        <Button size="sm" variant="gradient" className="shadow-lg">
                          Continue →
                        </Button>
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Overall Progress</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progressPercentage)}`}
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    {progress && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border dark:border-gray-700 border-blue-500/20">
                          <div className="font-black text-lg text-blue-600 dark:text-blue-400">{progress.completedLessons}/{progress.totalLessons}</div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">Lessons</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border dark:border-gray-700 border-purple-500/20">
                          <div className="font-black text-lg text-purple-600 dark:text-purple-400">{progress.watchedVideos}/{progress.totalVideos}</div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">Videos</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border dark:border-gray-700 border-orange-500/20">
                          <div className="font-black text-lg text-orange-600 dark:text-orange-400">{progress.completedExercises}/{progress.totalExercises}</div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">Exercises</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border dark:border-gray-700 border-green-500/20">
                          <div className="font-black text-lg text-green-600 dark:text-green-400">{progress.passedQuizzes}/{progress.totalQuizzes}</div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">Quizzes</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {completedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Completed Courses
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                {completedCourses.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedCourses.slice(0, 3).map((enrollment) => (
                <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
                  <div className="p-5 glass-subtle rounded-2xl hover:glass transition-all duration-300 cursor-pointer group border dark:border-gray-700 border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {enrollment.course.title}
                    </h4>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <span>✓</span> Completed
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No courses yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Start your learning journey by browsing our comprehensive course catalog</p>
              <Link href="/courses">
                <Button variant="gradient" size="lg" className="shadow-2xl">
                  Browse Courses →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
