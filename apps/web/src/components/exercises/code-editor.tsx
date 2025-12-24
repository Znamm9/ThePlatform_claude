'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  description?: string;
}

interface ExecutionResult {
  allTestsPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  error?: string;
}

interface Submission {
  id: string;
  submittedCode: string;
  isCorrect: boolean | null;
  testResults: ExecutionResult | null;
  pointsEarned: number;
  submittedAt: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  starterCode?: string;
  difficulty: string;
  points: number;
}

interface CodeEditorProps {
  exercise: Exercise;
}

export default function CodeEditor({ exercise }: CodeEditorProps) {
  const [code, setCode] = useState(exercise.starterCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [exercise.id]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises/submissions/${exercise.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(response.data);
      if (response.data.length > 0) {
        setLastSubmission(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises/submit`,
        {
          exerciseId: exercise.id,
          submittedCode: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLastSubmission(response.data);
      fetchSubmissions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{exercise.title}</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              exercise.difficulty
            )}`}
          >
            {exercise.difficulty}
          </span>
          <span className="text-sm text-gray-600">{exercise.points} points</span>
        </div>
        <p className="text-gray-700 mb-4">{exercise.description}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <p className="text-blue-800 whitespace-pre-wrap">{exercise.instructions}</p>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Solution</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {showHistory ? 'Hide' : 'Show'} History ({submissions.length})
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !code.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Code'}
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Write your code here..."
          spellCheck={false}
        />
      </div>

      {/* Submission History */}
      {showHistory && submissions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Submission History
          </h3>
          <div className="space-y-2">
            {submissions.map((sub, index) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    #{submissions.length - index}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </span>
                  {sub.isCorrect !== null && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.isCorrect ? 'Passed' : 'Failed'}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">
                    {sub.pointsEarned} / {exercise.points} points
                  </span>
                </div>
                <button
                  onClick={() => setCode(sub.submittedCode)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Load Code
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      {lastSubmission && lastSubmission.testResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  lastSubmission.testResults.allTestsPassed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {lastSubmission.testResults.passedTests} /{' '}
                {lastSubmission.testResults.totalTests} Passed
              </span>
              <span className="text-sm text-gray-600">
                {lastSubmission.pointsEarned} / {exercise.points} points
              </span>
            </div>
          </div>

          {lastSubmission.testResults.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">Error: {lastSubmission.testResults.error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lastSubmission.testResults.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.passed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Test Case {index + 1}
                      {result.description && `: ${result.description}`}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Input:</p>
                      <code className="text-gray-900">{result.input}</code>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Expected:</p>
                      <code className="text-gray-900">{result.expectedOutput}</code>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Your Output:</p>
                      <code className={result.passed ? 'text-green-700' : 'text-red-700'}>
                        {result.actualOutput || result.error || 'No output'}
                      </code>
                    </div>
                  </div>
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                      <p className="text-xs text-red-800">Error: {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
