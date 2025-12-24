'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LessonContent } from '@/components/lesson/lesson-content';
import VideoPlayer from '@/components/video/video-player';
import CodeEditor from '@/components/exercises/code-editor';
import QuizTaker from '@/components/quizzes/quiz-taker';
import QuizResults from '@/components/quizzes/quiz-results';
import Link from 'next/link';

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.lessonSlug]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // For this demo, we'll fetch by ID since we'd need to add slug lookup
      // In production, you'd want to fetch by slug
      const lessonId = params.lessonSlug as string;

      const [lessonRes, videosRes, exercisesRes, quizzesRes] = await Promise.all([
        apiClient.get(`/lessons/${lessonId}`),
        apiClient.get(`/videos/lesson/${lessonId}`),
        apiClient.get(`/exercises/lesson/${lessonId}`),
        apiClient.get(`/quizzes/lesson/${lessonId}`),
      ]);

      setLesson(lessonRes.data);
      setVideos(videosRes.data);
      setExercises(exercisesRes.data);
      setQuizzes(quizzesRes.data);

      // Set the first ready video as selected by default
      const readyVideos = videosRes.data.filter((v: any) => v.uploadStatus === 'READY');
      if (readyVideos.length > 0) {
        setSelectedVideo(readyVideos[0]);
      }

      if (lessonRes.data.course) {
        const courseLessons = await apiClient.get(
          `/lessons/course/${lessonRes.data.course.id}`
        );
        setLessons(courseLessons.data);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = lessons.findIndex((l: any) => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  // Check access (free preview or authenticated)
  const hasAccess = lesson.isFreePreview || isAuthenticated;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please login to access this lesson
            </p>
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link
                href={`/courses/${lesson.course.slug}`}
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                ← Back to {lesson.course.title}
              </Link>
              <h1 className="text-2xl font-bold mt-1">{lesson.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="pt-6">
                {lesson.description && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-700">{lesson.description}</p>
                  </div>
                )}

                {/* Video Player */}
                {videos.length > 0 && selectedVideo && selectedVideo.uploadStatus === 'READY' && (
                  <div className="mb-8">
                    <VideoPlayer
                      videoUrl={selectedVideo.cloudfrontUrl}
                      title={selectedVideo.title}
                      onProgressUpdate={async (watchedSeconds, completed) => {
                        if (!isAuthenticated) return;

                        try {
                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/videos/progress`,
                            {
                              videoId: selectedVideo.id,
                              lastPositionSeconds: watchedSeconds,
                              watchedSeconds,
                              completed,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                              },
                            }
                          );
                        } catch (error) {
                          console.error('Failed to update progress:', error);
                        }
                      }}
                    />

                    {videos.length > 1 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Other Videos</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {videos
                            .filter((v: any) => v.uploadStatus === 'READY' && v.id !== selectedVideo.id)
                            .map((video: any) => (
                              <button
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className="p-3 bg-gray-50 rounded hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                              >
                                <span className="text-sm">{video.title}</span>
                                <span className="text-xs text-gray-500">
                                  {video.durationSeconds
                                    ? `${Math.floor(video.durationSeconds / 60)}:${(video.durationSeconds % 60).toString().padStart(2, '0')}`
                                    : 'N/A'}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {lesson.content && (
                  <div className="mb-8">
                    <LessonContent content={lesson.content} />
                  </div>
                )}

                {/* Exercises */}
                {exercises.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Coding Exercises</h2>
                    {exercises.map((exercise: any) => (
                      <div key={exercise.id} className="mb-8">
                        <CodeEditor exercise={exercise} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Quizzes */}
                {quizzes.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quizzes</h2>
                    {quizzes.map((quiz: any) => (
                      <div key={quiz.id} className="mb-8">
                        {/* Quiz is not started */}
                        {activeQuizId !== quiz.id && !quizAttemptId && (
                          <div className="p-6 bg-white border rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                                {quiz.description && (
                                  <p className="text-gray-600 mt-2">{quiz.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-6 text-sm text-gray-600 mb-4">
                              <span>{quiz.questions.length} Questions</span>
                              <span>Passing Score: {quiz.passingScore}%</span>
                              {quiz.timeLimitMinutes && (
                                <span>Time Limit: {quiz.timeLimitMinutes} minutes</span>
                              )}
                            </div>
                            <Button
                              onClick={() => setActiveQuizId(quiz.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Start Quiz
                            </Button>
                          </div>
                        )}

                        {/* Quiz is active */}
                        {activeQuizId === quiz.id && !quizAttemptId && (
                          <QuizTaker
                            quizId={quiz.id}
                            onComplete={(attemptId, passed) => {
                              setQuizAttemptId(attemptId);
                              setActiveQuizId(null);
                            }}
                          />
                        )}

                        {/* Show results if this quiz was just completed */}
                        {quizAttemptId && activeQuizId !== quiz.id && (
                          <div className="mb-8">
                            <QuizResults
                              attemptId={quizAttemptId}
                              onRetry={() => {
                                setQuizAttemptId(null);
                                setActiveQuizId(quiz.id);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-12 pt-6 border-t flex items-center justify-between">
                  {prevLesson ? (
                    <Link href={`/courses/${lesson.course.slug}/lessons/${prevLesson.id}`}>
                      <Button variant="outline">
                        ← Previous: {prevLesson.title}
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <Link href={`/courses/${lesson.course.slug}/lessons/${nextLesson.id}`}>
                      <Button>
                        Next: {nextLesson.title} →
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/courses/${lesson.course.slug}`}>
                      <Button>Back to Course</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Curriculum */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Course Curriculum</h3>
                <div className="space-y-1">
                  {lessons.map((l: any, index: number) => (
                    <Link
                      key={l.id}
                      href={`/courses/${lesson.course.slug}/lessons/${l.id}`}
                    >
                      <div
                        className={`p-2 rounded text-sm cursor-pointer ${
                          l.id === lesson.id
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 mt-0.5">
                            {index + 1}.
                          </span>
                          <span className="flex-1">{l.title}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
