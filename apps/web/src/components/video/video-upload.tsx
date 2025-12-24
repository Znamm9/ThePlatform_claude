'use client';

import { useState } from 'react';
import axios from 'axios';

interface VideoUploadProps {
  lessonId: string;
  onUploadComplete: () => void;
}

export default function VideoUpload({ lessonId, onUploadComplete }: VideoUploadProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Please provide a title and select a video file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Step 1: Create video record and get presigned URL
      const createResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/videos`,
        {
          title,
          lessonId,
          fileName: file.name,
          contentType: file.type,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { video, uploadUrl, s3Key } = createResponse.data;

      // Step 2: Upload file to S3 using presigned URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setProgress(percentCompleted);
        },
      });

      // Step 3: Mark upload as complete
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/videos/${video.id}/complete-upload`,
        {
          s3Key,
          fileSizeBytes: file.size,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setTitle('');
      setFile(null);
      setProgress(0);
      onUploadComplete();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Video</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 mb-1">
            Video Title
          </label>
          <input
            id="video-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 mb-1">
            Video File
          </label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {file && (
            <p className="mt-1 text-sm text-gray-500">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploading && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file || !title.trim()}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </div>
  );
}
