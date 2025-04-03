import { useState, useEffect } from 'react';
import { getCurrentBrainbox, getTopPerformers } from '../../services/brainboxService';
import { BrainIcon, TrophyIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';

const BrainboxOfTheMonth = () => {
  const [brainbox, setBrainbox] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentBrainbox = getCurrentBrainbox();
        const performers = getTopPerformers(5);
        setBrainbox(currentBrainbox);
        setTopPerformers(performers);
      } catch (error) {
        console.error('Failed to load brainbox data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Brainbox of the Month</h2>
        <BrainIcon className="h-6 w-6 text-indigo-500" />
      </div>

      {brainbox ? (
        <div className="space-y-6">
          {/* Current Brainbox */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={brainbox.avatarUrl}
                alt={brainbox.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{brainbox.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {brainbox.month} {brainbox.year} Champion
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {brainbox.stats.totalPoints} points
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {brainbox.stats.correctAnswers} correct answers
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. {brainbox.stats.averageTime.toFixed(1)}s per answer
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BrainIcon className="h-5 w-5 text-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {brainbox.stats.quizParticipation} quizzes
                </span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Performers This Month
            </h3>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.userId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performer.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {performer.totalPoints} pts
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {performer.correctAnswers} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            The Brainbox of the Month will be announced at the end of the month.
            Keep participating in quizzes and brain teasers to be in with a chance!
          </p>
        </div>
      )}
    </div>
  );
};

export default BrainboxOfTheMonth; 