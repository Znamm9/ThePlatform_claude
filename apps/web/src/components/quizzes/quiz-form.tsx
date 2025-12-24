'use client';

import { useState } from 'react';
import axios from 'axios';

interface QuizQuestion {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_BASED';
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  points: number;
}

interface QuizFormProps {
  lessonId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QuizForm({ lessonId, onSuccess, onCancel }: QuizFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_BASED'>('MULTIPLE_CHOICE');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<any>('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      alert('Question text is required');
      return;
    }

    if (!newCorrectAnswer) {
      alert('Correct answer is required');
      return;
    }

    const question: QuizQuestion = {
      questionText: newQuestionText,
      questionType: newQuestionType,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation || undefined,
      points: newPoints,
    };

    if (newQuestionType === 'MULTIPLE_CHOICE') {
      const validOptions = newOptions.filter(o => o.trim());
      if (validOptions.length < 2) {
        alert('Multiple choice questions need at least 2 options');
        return;
      }
      question.options = validOptions;
    }

    setQuestions([...questions, question]);

    // Reset form
    setNewQuestionText('');
    setNewQuestionType('MULTIPLE_CHOICE');
    setNewOptions(['', '', '', '']);
    setNewCorrectAnswer('');
    setNewExplanation('');
    setNewPoints(1);
    setShowQuestionForm(false);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (questions.length === 0) {
      setError('Add at least one question to the quiz');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes`,
        {
          lessonId,
          title,
          description: description || undefined,
          passingScore,
          timeLimitMinutes: timeLimitMinutes || undefined,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
          <input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            min={0}
            max={100}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time Limit (minutes, optional)</label>
          <input
            type="number"
            value={timeLimitMinutes || ''}
            onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : null)}
            min={1}
            placeholder="No limit"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Questions ({questions.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showQuestionForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {/* New Question Form */}
        {showQuestionForm && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Text</label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                placeholder="What is the capital of France?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                <select
                  value={newQuestionType}
                  onChange={(e) => {
                    setNewQuestionType(e.target.value as any);
                    setNewCorrectAnswer('');
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="CODE_BASED">Code Based</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  min={1}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                />
              </div>
            </div>

            {/* Options for Multiple Choice */}
            {newQuestionType === 'MULTIPLE_CHOICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {newOptions.map((option, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ''])}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Option
                </button>
              </div>
            )}

            {/* Correct Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
              {newQuestionType === 'TRUE_FALSE' ? (
                <select
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value === 'true')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                >
                  <option value="">Select...</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                  placeholder={newQuestionType === 'MULTIPLE_CHOICE' ? 'Enter exact text of correct option' : 'Enter expected output'}
                />
              )}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
                placeholder="Explain why this is the correct answer..."
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Question to Quiz
            </button>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.questionText}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {question.questionType} | Points: {question.points}
                    </p>
                    {question.options && question.options.length > 0 && (
                      <ul className="mt-2 ml-4 text-sm text-gray-600">
                        {question.options.map((opt, optIdx) => (
                          <li key={optIdx}>
                            {opt === question.correctAnswer ? '✓ ' : '○ '}
                            {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="ml-4 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}
