import { logError } from '../utils/error';
import { awardPoints } from './rewardsService';

export interface BrainboxStats {
  userId: string;
  username: string;
  points: number;
  activities: number;
  streakDays: number;
}

export const getBrainboxOfTheMonth = async (): Promise<BrainboxStats> => {
  try {
    // TODO: Implement actual API call
    return {
      userId: '1',
      username: 'Brainbox User',
      points: 1000,
      activities: 50,
      streakDays: 30
    };
  } catch (error) {
    logError(error, 'getBrainboxOfTheMonth');
    throw error;
  }
};

export const awardBrainboxPoints = async (userId: string, points: number): Promise<void> => {
  try {
    await awardPoints(userId, points, 'brainbox');
  } catch (error) {
    logError(error, 'awardBrainboxPoints');
    throw error;
  }
};

export const getBrainboxLeaderboard = async (): Promise<Array<{ userId: string; username: string; points: number }>> => {
  try {
    // TODO: Implement actual API call
    return [];
  } catch (error) {
    logError(error, 'getBrainboxLeaderboard');
    throw error;
  }
}; 