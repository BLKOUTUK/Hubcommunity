import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/quizService';
import { TrophyIcon, StarIcon } from 'lucide-react';

interface LeaderboardProps {
  type: 'quiz' | 'brain-teaser';
}

const Leaderboard = ({ type }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {type === 'quiz' ? 'Weekly Quiz' : 'Brain Teaser'} Leaderboard
        </h2>
        <TrophyIcon className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {index < 3 ? (
                  <div className="h-8 w-8 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                    {index + 1}
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                    {index + 1}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entry.correctAnswers} correct answers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {entry.points}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 