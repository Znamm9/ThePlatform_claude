export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Course {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  instructorId: string;
  isPremium: boolean;
  priceCents: number;
  estimatedDurationHours?: number;
  difficultyLevel?: DifficultyLevel;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  iconUrl?: string;
  sortOrder: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  sortOrder: number;
  durationMinutes?: number;
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseData {
  categoryId: string;
  title: string;
  description: string;
  shortDescription?: string;
  isPremium: boolean;
  priceCents?: number;
  estimatedDurationHours?: number;
  difficultyLevel?: DifficultyLevel;
}
