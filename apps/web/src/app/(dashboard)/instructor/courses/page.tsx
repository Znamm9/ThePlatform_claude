'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses/instructor/my-courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await apiClient.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await apiClient.post(`/courses/${courseId}/unpublish`);
      } else {
        await apiClient.post(`/courses/${courseId}/publish`);
      }
      fetchCourses();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update course status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your courses and lessons</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button size="lg">Create New Course</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
            <Link href="/instructor/courses/new">
              <Button>Create Your First Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {course.category?.name}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{course._count?.lessons || 0} lessons</span>
                  <span>{course._count?.enrollments || 0} students</span>
                </div>

                <div className="space-y-2">
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Course
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleTogglePublish(course.id, course.isPublished)
                    }
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(course.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
