'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import VideoUpload from '@/components/video/video-upload';
import VideoList from '@/components/video/video-list';

interface Lesson {
  id: string;
  title: string;
  courseId: string;
}

interface Video {
  id: string;
  title: string;
  durationSeconds: number | null;
  fileSizeBytes: bigint | null;
  uploadStatus: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  cloudfrontUrl: string;
  createdAt: string;
}

export default function ManageVideosPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  const courseId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonRes, videosRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/videos/lesson/${lessonId}`),
      ]);

      setLesson(lessonRes.data);
      setVideos(videosRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border dark:border-gray-700 border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
          className="text-green-600 hover:text-green-700 mb-4"
        >
          ← Back to Lessons
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Videos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Lesson: <span className="font-semibold">{lesson?.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <VideoUpload lessonId={lessonId} onUploadComplete={fetchData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Videos ({videos.length})
          </h2>
          <VideoList videos={videos} onVideoDeleted={fetchData} isInstructor={true} />
        </div>
      </div>
    </div>
  );
}
