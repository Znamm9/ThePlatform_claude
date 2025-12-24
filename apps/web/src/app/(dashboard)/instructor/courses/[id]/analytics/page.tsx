'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizStat {
  quizId: string;
  quizTitle: string;
  lessonTitle: string;
  attempts: number;
  passes: number;
  passRate: number;
  averageScore: number;
}

interface StudentEnrollment {
  id: string;
  progressPercentage: number;
  enrolledAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Analytics {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  totalExercises: number;
  exerciseAttempts: number;
  exerciseCompletions: number;
  exerciseCompletionRate: number;
  totalQuizzes: number;
  quizAttemptCount: number;
  quizPasses: number;
  quizPassRate: number;
  averageQuizScore: number;
  quizStats: QuizStat[];
  enrollments: StudentEnrollment[];
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [params.id]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/analytics/course/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border dark:border-gray-700 border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 mb-4 flex items-center gap-2"
        >
          <span>&larr;</span> Back to Course
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Course Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{analytics.courseTitle}</p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalStudents}</div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.activeStudents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.averageProgress}%</div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.completedStudents} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Exercise Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{analytics.exerciseCompletionRate}%</div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.exerciseCompletions}/{analytics.exerciseAttempts} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{analytics.quizPassRate}%</div>
            <p className="text-sm text-gray-500 mt-1">
              Avg score: {analytics.averageQuizScore}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Exercises:</span>
                <span className="font-medium">{analytics.totalExercises}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Attempts:</span>
                <span className="font-medium">{analytics.exerciseAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completions:</span>
                <span className="font-medium text-green-600">{analytics.exerciseCompletions}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analytics.exerciseCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Quizzes:</span>
                <span className="font-medium">{analytics.totalQuizzes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Attempts:</span>
                <span className="font-medium">{analytics.quizAttemptCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Passes:</span>
                <span className="font-medium text-green-600">{analytics.quizPasses}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${analytics.quizPassRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Enrolled:</span>
                <span className="font-medium">{analytics.totalStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active:</span>
                <span className="font-medium text-blue-600">{analytics.activeStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                <span className="font-medium text-green-600">{analytics.completedStudents}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Engagement: {analytics.totalStudents > 0 ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Performance Breakdown */}
      {analytics.quizStats.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Quiz</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Lesson</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Attempts</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Passes</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Pass Rate</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.quizStats.map((quiz) => (
                    <tr key={quiz.quizId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">{quiz.quizTitle}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{quiz.lessonTitle}</td>
                      <td className="py-3 px-4 text-right">{quiz.attempts}</td>
                      <td className="py-3 px-4 text-right text-green-600">{quiz.passes}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${quiz.passRate >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {quiz.passRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{quiz.averageScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollments ({analytics.enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Progress</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {analytics.enrollments.slice(0, 20).map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 font-medium">{enrollment.user.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{enrollment.user.email}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              enrollment.progressPercentage >= 80
                                ? 'bg-green-500'
                                : enrollment.progressPercentage >= 50
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-medium w-12 text-right">{enrollment.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.enrollments.length > 20 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing 20 of {analytics.enrollments.length} students
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
