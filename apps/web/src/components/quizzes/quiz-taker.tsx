'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Question {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_BASED';
  options?: string[];
  points: number;
  sortOrder: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes?: number;
  questions: Question[];
}

interface QuizTakerProps {
  quizId: string;
  onComplete: (attemptId: string, passed: boolean) => void;
}

export default function QuizTaker({ quizId, onComplete }: QuizTakerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.timeLimitMinutes && timeLeft === null) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`
      );
      setQuiz(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const answerArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/submit`,
        {
          quizId,
          answers: answerArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onComplete(response.data.id, response.data.passed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            )}
          </div>
          {timeLeft !== null && (
            <div className={`text-lg font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="flex gap-6 text-sm text-gray-600">
          <span>{quiz.questions.length} Questions</span>
          <span>Passing Score: {quiz.passingScore}%</span>
          <span>Answered: {getAnsweredCount()}/{quiz.questions.length}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Question {index + 1}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({question.points} point{question.points !== 1 ? 's' : ''})
                </span>
              </h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {question.questionType.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-900 mb-4">{question.questionText}</p>

            {/* Multiple Choice */}
            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      answers[question.id] === option ? 'bg-green-50 border-green-500' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.questionType === 'TRUE_FALSE' && (
              <div className="space-y-2">
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    answers[question.id] === true ? 'bg-green-50 border-green-500' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === true}
                    onChange={() => handleAnswerChange(question.id, true)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">True</span>
                </label>
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    answers[question.id] === false ? 'bg-green-50 border-green-500' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === false}
                    onChange={() => handleAnswerChange(question.id, false)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">False</span>
                </label>
              </div>
            )}

            {/* Code Based */}
            {question.questionType === 'CODE_BASED' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={6}
                placeholder="Enter your code here..."
                className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:border-green-500 focus:ring-green-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || getAnsweredCount() === 0}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>

      {getAnsweredCount() < quiz.questions.length && (
        <p className="text-center text-sm text-amber-600 mt-4">
          You have {quiz.questions.length - getAnsweredCount()} unanswered question(s)
        </p>
      )}
    </div>
  );
}
