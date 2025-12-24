'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CourseSkeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, categoriesRes] = await Promise.all([
        apiClient.get('/courses', {
          params: {
            ...(selectedCategory && { categoryId: selectedCategory }),
            ...(search && { search }),
          },
        }),
        apiClient.get('/categories'),
      ]);

      setCourses(coursesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-animated opacity-20 -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="glass-strong border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl font-black mb-4 animate-fade-in-up">
            <span className="gradient-text">QA Automation Courses</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master QA automation with our comprehensive courses
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === '' ? 'default' : 'glass'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'glass'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name} ({category._count?.courses || 0})
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="card-glass inline-block px-8 py-6">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No courses found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.slug}`}>
                <Card className="h-full cursor-pointer group overflow-hidden">
                  {course.thumbnailUrl && (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-200 dark:to-dark-300 rounded-t-2xl overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-full">
                        {course.category?.name}
                      </span>
                      {course.isPremium && (
                        <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 bg-secondary-500/10 px-3 py-1.5 rounded-full">
                          ${(course.priceCents / 100).toFixed(2)}
                        </span>
                      )}
                      {!course.isPremium && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {course.shortDescription || course.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span>{course._count?.lessons || 0} lessons</span>
                      {course.difficultyLevel && (
                        <span className="capitalize px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-200">
                          {course.difficultyLevel.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {course.instructor && (
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        By <span className="font-medium text-gray-700 dark:text-gray-300">{course.instructor.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
