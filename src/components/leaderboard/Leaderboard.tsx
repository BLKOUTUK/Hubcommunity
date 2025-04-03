import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBrainTeaserLeaderboard } from '@/services/brainTeaserService';

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
}

export const Leaderboard: React.FC = () => {
  const { data: leaderboard, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: getBrainTeaserLeaderboard
  });

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  if (error) {
    return <div>Error loading leaderboard</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {leaderboard?.map((entry, index) => (
          <div key={entry.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span className="font-bold">#{index + 1} {entry.name}</span>
            <span>{entry.points} points</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 