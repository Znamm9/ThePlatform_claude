'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  content: z.string().optional(),
  sortOrder: z.number().min(0),
  durationMinutes: z.number().min(1).optional(),
  isFreePreview: z.boolean(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function NewLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      sortOrder: 0,
      isFreePreview: false,
    },
  });

  const onSubmit = async (data: LessonFormData) => {
    try {
      setIsLoading(true);
      await apiClient.post(`/lessons/course/${params.id}`, data);
      router.push(`/instructor/courses/${params.id}/lessons`);
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      alert(error.response?.data?.message || 'Failed to create lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Lesson</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new lesson to your course</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Lesson Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Locators"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the lesson"
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Lesson Content</Label>
              <textarea
                id="content"
                rows={12}
                className="flex w-full rounded-md border dark:border-gray-700 border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 font-mono"
                placeholder="Write your lesson content here... You can use Markdown formatting."
                {...register('content')}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tip: You can use Markdown for formatting (headings, lists, code
                blocks, etc.)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('sortOrder', { valueAsNumber: true })}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order in which this lesson appears (0 = first)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min="1"
                  placeholder="30"
                  {...register('durationMinutes', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isFreePreview"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                {...register('isFreePreview')}
              />
              <Label htmlFor="isFreePreview" className="cursor-pointer">
                Allow free preview of this lesson
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Lesson'}
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
