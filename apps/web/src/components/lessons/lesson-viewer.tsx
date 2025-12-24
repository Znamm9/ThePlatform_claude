'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import apiClient from '@/lib/api-client';

interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  durationSeconds?: number;
  sortOrder: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  starterCode?: string;
  solution?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
}

interface LessonViewerProps {
  lessonId: string;
  lessonContent?: string;
  videos: Video[];
  exercises: Exercise[];
  quizzes: Quiz[];
}

export default function LessonViewer({
  lessonId,
  lessonContent,
  videos,
  exercises,
  quizzes,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'videos' | 'exercises' | 'quizzes'>('content');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    // Auto-select first video if available
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos]);

  const renderContent = () => {
    return (
      <div className="prose max-w-none">
        {lessonContent ? (
          <div dangerouslySetInnerHTML={{ __html: lessonContent }} />
        ) : (
          <p className="text-gray-500">No content available for this lesson yet.</p>
        )}
      </div>
    );
  };

  const renderVideos = () => {
    if (videos.length === 0) {
      return <p className="text-gray-500">No videos available for this lesson.</p>;
    }

    return (
      <div className="space-y-4">
        {selectedVideo && (
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                key={selectedVideo.id}
                controls
                className="w-full h-full"
                src={selectedVideo.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
            )}
          </div>
        )}

        {videos.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">All Videos</h4>
            <div className="space-y-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedVideo?.id === video.id
                      ? 'bg-primary-50 border-primary-500'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{video.title}</p>
                      {video.description && (
                        <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                      )}
                    </div>
                    {video.durationSeconds && (
                      <span className="text-sm text-gray-500">
                        {Math.floor(video.durationSeconds / 60)}:{String(video.durationSeconds % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExercises = () => {
    if (exercises.length === 0) {
      return <p className="text-gray-500">No exercises available for this lesson.</p>;
    }

    return (
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{exercise.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    exercise.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    exercise.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exercise.difficulty}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {exercise.points} pts
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setSelectedExercise(exercise)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Start Exercise
              </Button>
            </CardContent>
          </Card>
        ))}

        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{selectedExercise.title}</CardTitle>
                  <Button
                    onClick={() => setSelectedExercise(null)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{selectedExercise.description}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Starter Code:</p>
                  <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
                    <code>{selectedExercise.starterCode || '// Write your code here'}</code>
                  </pre>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Interactive code editor will be integrated here
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderQuizzes = () => {
    if (quizzes.length === 0) {
      return <p className="text-gray-500">No quizzes available for this lesson.</p>;
    }

    return (
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <span>Passing Score: {quiz.passingScore}%</span>
                {quiz.timeLimit && <span>Time Limit: {quiz.timeLimit} minutes</span>}
              </div>
              <Button
                onClick={() => setSelectedQuiz(quiz)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}

        {selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{selectedQuiz.title}</CardTitle>
                  <Button
                    onClick={() => setSelectedQuiz(null)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Quiz interface will be integrated here
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Content
          </button>
          {videos.length > 0 && (
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Videos ({videos.length})
            </button>
          )}
          {exercises.length > 0 && (
            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'exercises'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Exercises ({exercises.length})
            </button>
          )}
          {quizzes.length > 0 && (
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Quizzes ({quizzes.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'content' && renderContent()}
        {activeTab === 'videos' && renderVideos()}
        {activeTab === 'exercises' && renderExercises()}
        {activeTab === 'quizzes' && renderQuizzes()}
      </div>
    </div>
  );
}
