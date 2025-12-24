'use client';

import { useState } from 'react';
import axios from 'axios';

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface ExerciseFormProps {
  lessonId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExerciseForm({ lessonId, onSuccess, onCancel }: ExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [solutionCode, setSolutionCode] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [points, setPoints] = useState(10);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', description: '' },
  ]);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', description: '' }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const validTestCases = testCases.filter((tc) => tc.input && tc.expectedOutput);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/exercises`,
        {
          lessonId,
          title,
          description,
          instructions,
          starterCode: starterCode || undefined,
          solutionCode: solutionCode || undefined,
          difficulty,
          points,
          testCases: validTestCases.length > 0 ? validTestCases : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create exercise');
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
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
          placeholder="Write detailed instructions for the student..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Starter Code (Optional)</label>
        <textarea
          value={starterCode}
          onChange={(e) => setStarterCode(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border font-mono text-sm"
          placeholder="function solution(input) {&#10;  // Your code here&#10;}"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Solution Code (Optional)</label>
        <textarea
          value={solutionCode}
          onChange={(e) => setSolutionCode(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border font-mono text-sm"
          placeholder="function solution(input) {&#10;  return input * 2;&#10;}"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Points</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            min={0}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-4 py-2 border"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Test Cases</label>
          <button
            type="button"
            onClick={handleAddTestCase}
            className="text-sm text-green-600 hover:text-green-700"
          >
            + Add Test Case
          </button>
        </div>

        <div className="space-y-4">
          {testCases.map((tc, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Test Case {index + 1}</span>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600">Input</label>
                <input
                  type="text"
                  value={tc.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-1.5 border text-sm"
                  placeholder="e.g., 5 or {&quot;a&quot;: 1, &quot;b&quot;: 2}"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Expected Output</label>
                <input
                  type="text"
                  value={tc.expectedOutput}
                  onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-1.5 border text-sm"
                  placeholder="e.g., 10 or true"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Description (Optional)</label>
                <input
                  type="text"
                  value={tc.description}
                  onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-1.5 border text-sm"
                  placeholder="e.g., Should double the input"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Exercise'}
        </button>
      </div>
    </form>
  );
}
