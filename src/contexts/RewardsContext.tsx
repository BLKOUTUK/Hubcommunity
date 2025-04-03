import React, { createContext, useContext, useState, useCallback } from 'react';
import { awardPointsAndSync } from '../services/rewardsService';
import { useAuth } from './AuthContext';

interface RewardsContextType {
  points: number;
  syncPoints: () => Promise<void>;
  awardPoints: (amount: number) => Promise<void>;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  const syncPoints = useCallback(async () => {
    if (!user) return;
    try {
      const updatedPoints = await awardPointsAndSync(user.id);
      setPoints(updatedPoints);
    } catch (error) {
      console.error('Failed to sync points:', error);
    }
  }, [user]);

  const awardPoints = useCallback(async (amount: number) => {
    if (!user) return;
    try {
      const updatedPoints = await awardPointsAndSync(user.id, amount);
      setPoints(updatedPoints);
    } catch (error) {
      console.error('Failed to award points:', error);
    }
  }, [user]);

  return (
    <RewardsContext.Provider value={{ points, syncPoints, awardPoints }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = (): RewardsContextType => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}; 