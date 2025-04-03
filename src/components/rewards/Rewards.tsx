import React, { useState, useEffect } from 'react';
import { getRewards, claimReward } from '../../services/rewardsService';
import { useAuth } from '../../contexts/AuthContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  claimed: boolean;
}

export const Rewards: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const data = await getRewards();
        setRewards(data.rewards);
        setUserPoints(data.userPoints);
      } catch (err) {
        setError('Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const handleClaimReward = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
      setRewards(rewards.map(reward => 
        reward.id === rewardId ? { ...reward, claimed: true } : reward
      ));
    } catch (err) {
      setError('Failed to claim reward');
    }
  };

  if (loading) {
    return <div className="p-4 bg-white rounded-lg shadow">Loading rewards...</div>;
  }

  if (error) {
    return <div className="p-4 bg-white rounded-lg shadow text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Rewards</h2>
      <p className="text-sm text-gray-600 mb-4">Your points: {userPoints}</p>
      
      <div className="space-y-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`p-4 border rounded-lg ${
              reward.claimed ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{reward.name}</h3>
                <p className="text-sm text-gray-600">{reward.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reward.pointsRequired} points required
                </p>
              </div>
              {!reward.claimed && userPoints >= reward.pointsRequired && (
                <button
                  onClick={() => handleClaimReward(reward.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Claim
                </button>
              )}
            </div>
            {reward.claimed && (
              <p className="text-sm text-green-600 mt-2">✓ Claimed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 