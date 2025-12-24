'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  shortDescription: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  isPremium: z.boolean(),
  priceCents: z.number().min(0).optional(),
  estimatedDurationHours: z.number().min(1).optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      isPremium: false,
      priceCents: 0,
    },
  });

  const isPremium = watch('isPremium');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/courses', {
        ...data,
        priceCents: data.isPremium ? data.priceCents : 0,
      });
      router.push('/instructor/courses');
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Course</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Fill in the details to create your course
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Selenium WebDriver"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                placeholder="Brief one-line description"
                {...register('shortDescription')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <textarea
                id="description"
                rows={6}
                className="flex w-full rounded-md border dark:border-gray-700 border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                placeholder="Detailed course description..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-md border dark:border-gray-700 border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                {...register('categoryId')}
              >
                <option value="">Select a category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Difficulty Level</Label>
              <select
                id="difficultyLevel"
                className="flex h-10 w-full rounded-md border dark:border-gray-700 border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                {...register('difficultyLevel')}
              >
                <option value="">Select difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDurationHours">
                Estimated Duration (hours)
              </Label>
              <Input
                id="estimatedDurationHours"
                type="number"
                min="1"
                placeholder="e.g., 40"
                {...register('estimatedDurationHours', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isPremium"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                {...register('isPremium')}
              />
              <Label htmlFor="isPremium" className="cursor-pointer">
                This is a premium course
              </Label>
            </div>

            {isPremium && (
              <div className="space-y-2">
                <Label htmlFor="priceCents">Price (USD)</Label>
                <Input
                  id="priceCents"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="49.99"
                  {...register('priceCents', {
                    setValueAs: (v) => (v ? Math.round(parseFloat(v) * 100) : 0),
                  })}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the price in dollars (e.g., 49.99)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Course'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
