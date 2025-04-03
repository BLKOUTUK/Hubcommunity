import { useState } from 'react';
import { getDailyBrainTeaser, submitBrainTeaserAnswer } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { LightbulbIcon } from 'lucide-react';

const DailyBrainTeaser = () => {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; points: number } | null>(null);

  const teaser = getDailyBrainTeaser();

  const handleSubmit = async () => {
    if (!answer.trim() || !user) return;

    try {
      const result = await submitBrainTeaserAnswer(user.id, teaser.id, answer);
      setResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Brain Teaser</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {teaser.category}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {teaser.question}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={showResult}
          />

          {!showHint && !showResult && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <LightbulbIcon className="h-4 w-4" />
              Need a hint?
            </button>
          )}

          {showHint && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-gray-900 dark:text-white">
                Hint: {teaser.hint}
              </p>
            </div>
          )}
        </div>
      </div>

      {showResult && result && (
        <div className={`mb-6 p-4 rounded-lg ${
          result.correct 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className="text-sm text-gray-900 dark:text-white mb-2">
            {result.correct ? 'Correct!' : 'Incorrect!'} {result.points} points earned.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The answer was: {teaser.answer}
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!answer.trim() || showResult}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </div>
  );
};

export default DailyBrainTeaser; 