import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import rewardsService, {
  RewardAction,
  Achievement,
  UserReward,
  LeaderboardEntry
} from '../services/rewards';
import { logError } from '../services/errorLogging';

/**
 * Hook for interacting with the rewards system
 */
export const useRewards = () => {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserReward | null>(null);
  const [rewardActions, setRewardActions] = useState<RewardAction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user rewards data
   */
  const loadUserRewards = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const rewards = await rewardsService.getUserRewards(user.username);
      
      // If the user doesn't exist in the rewards system yet, initialize them
      if (!rewards) {
        const initializedRewards = await rewardsService.initializeUserRewards(
          user.username,
          user.name
        );
        setUserRewards(initializedRewards);
      } else {
        setUserRewards(rewards);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user rewards';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load reward actions
   */
  const loadRewardActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const actions = await rewardsService.getRewardActions();
      setRewardActions(actions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reward actions';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load achievements
   */
  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getAchievements();
      setAchievements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load leaderboard
   */
  const loadLeaderboard = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await rewardsService.getLeaderboard(limit);
      setLeaderboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Award points to the current user
   */
  const awardPoints = useCallback(async (actionId: string, notes?: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedRewards = await rewardsService.awardPoints(
        user.username,
        actionId,
        notes
      );
      
      setUserRewards(updatedRewards);
      return updatedRewards;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to award points';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get a specific achievement by ID
   */
  const getAchievementById = useCallback((achievementId: string) => {
    return achievements.find(a => a.id === achievementId) || null;
  }, [achievements]);

  /**
   * Check if a user has a specific achievement
   */
  const hasAchievement = useCallback((achievementId: string) => {
    if (!userRewards) return false;
    return userRewards.achievements.some(a => a.achievementId === achievementId);
  }, [userRewards]);

  /**
   * Get unlocked achievements with full details
   */
  const getUnlockedAchievements = useCallback(() => {
    if (!userRewards || !achievements.length) return [];
    
    return userRewards.achievements
      .map(userAchievement => {
        const achievementDetails = achievements.find(
          a => a.id === userAchievement.achievementId
        );
        
        if (!achievementDetails) return null;
        
        return {
          ...achievementDetails,
          unlockedAt: userAchievement.unlockedAt
        };
      })
      .filter(a => a !== null) as (Achievement & { unlockedAt: string })[];
  }, [userRewards, achievements]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadUserRewards();
    }
  }, [user, loadUserRewards]);

  useEffect(() => {
    loadRewardActions();
    loadAchievements();
    loadLeaderboard();
  }, [loadRewardActions, loadAchievements, loadLeaderboard]);

  return {
    userRewards,
    rewardActions,
    achievements,
    leaderboard,
    loading,
    error,
    loadUserRewards,
    loadRewardActions,
    loadAchievements,
    loadLeaderboard,
    awardPoints,
    getAchievementById,
    hasAchievement,
    getUnlockedAchievements
  };
};

export default useRewards;