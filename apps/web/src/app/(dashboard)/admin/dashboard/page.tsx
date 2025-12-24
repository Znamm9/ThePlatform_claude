'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CardSkeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  publishedCourses: number;
  recentUsers: any[];
  recentCourses: any[];
  recentPayments: any[];
}

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, coursesRes, enrollmentsRes, paymentsRes] = await Promise.all([
        apiClient.get('/auth/users'),
        apiClient.get('/courses/admin/all'),
        apiClient.get('/enrollments/admin/all'),
        apiClient.get('/payments/admin/all'),
      ]);

      const users = usersRes.data;
      const courses = coursesRes.data;
      const enrollments = enrollmentsRes.data;
      const payments = paymentsRes.data;

      // Calculate statistics
      const totalRevenue = payments
        .filter((p: any) => p.status === 'SUCCEEDED')
        .reduce((sum: number, p: any) => sum + p.amountCents, 0);

      const publishedCourses = courses.filter((c: any) => c.isPublished).length;

      // Recent data (last 5)
      const recentUsers = users.slice(0, 5);
      const recentCourses = courses.slice(0, 5);
      const recentPayments = payments.slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        activeUsers: users.filter((u: any) => u.emailVerified).length,
        publishedCourses,
        recentUsers,
        recentCourses,
        recentPayments,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
        <Button onClick={fetchStats} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.activeUsers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCourses}</div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalEnrollments}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              All courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              From premium courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Users</CardTitle>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'INSTRUCTOR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Courses</CardTitle>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No courses yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        By {course.instructor?.name || 'Unknown'}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        course.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Payments</CardTitle>
            <Link href="/admin/payments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-sm">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      User
                    </th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Course
                    </th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((payment: any) => (
                    <tr key={payment.id} className="border-b dark:border-gray-700 last:border-b-0">
                      <td className="py-3 px-3 text-sm">
                        {payment.user?.email || 'Unknown'}
                      </td>
                      <td className="py-3 px-3 text-sm">
                        {payment.course?.title || 'Unknown'}
                      </td>
                      <td className="py-3 px-3 text-sm font-medium">
                        ${(payment.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'SUCCEEDED'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
