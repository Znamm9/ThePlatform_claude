'use client';

import { useState } from 'react';
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  durationSeconds: number | null;
  fileSizeBytes: bigint | null;
  uploadStatus: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  cloudfrontUrl: string;
  createdAt: string;
}

interface VideoListProps {
  videos: Video[];
  onVideoDeleted: () => void;
  isInstructor?: boolean;
}

export default function VideoList({ videos, onVideoDeleted, isInstructor = false }: VideoListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeleting(videoId);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onVideoDeleted();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete video');
    } finally {
      setDeleting(null);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: bigint | null) => {
    if (!bytes) return 'Unknown';
    const mb = Number(bytes) / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      UPLOADING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No videos uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{video.title}</h4>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(video.uploadStatus)}`}>
                  {video.uploadStatus}
                </span>
                {video.durationSeconds && (
                  <span>Duration: {formatDuration(video.durationSeconds)}</span>
                )}
                {video.fileSizeBytes && (
                  <span>Size: {formatFileSize(video.fileSizeBytes)}</span>
                )}
              </div>
            </div>

            {isInstructor && (
              <button
                onClick={() => handleDelete(video.id)}
                disabled={deleting === video.id}
                className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deleting === video.id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
