import { logError } from '../utils/error';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  rank: number;
  badges: string[];
  level: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalUsers: number;
  lastUpdated: Date;
}

export interface LeaderboardFilter {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category?: 'overall' | 'quiz' | 'brain-teaser' | 'events';
  limit?: number;
}

export const getLeaderboard = async (filter?: LeaderboardFilter): Promise<LeaderboardEntry[]> => {
  try {
    // Mock implementation - replace with actual API call
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        userId: '1',
        username: 'brainiac',
        points: 1000,
        rank: 1,
        badges: ['Quiz Master', 'Brain Teaser Champion'],
        level: 5
      },
      {
        userId: '2',
        username: 'puzzlemaster',
        points: 850,
        rank: 2,
        badges: ['Event Enthusiast'],
        level: 4
      },
      {
        userId: '3',
        username: 'riddlesolver',
        points: 700,
        rank: 3,
        badges: ['Rising Star'],
        level: 3
      }
    ];

    return mockLeaderboard
      .slice(0, filter?.limit || mockLeaderboard.length)
      .sort((a, b) => b.points - a.points);
  } catch (error) {
    logError(error, 'getLeaderboard');
    throw error;
  }
};

export const getUserRank = async (userId: string): Promise<LeaderboardEntry | null> => {
  try {
    const leaderboard = await getLeaderboard();
    return leaderboard.find(entry => entry.userId === userId) || null;
  } catch (error) {
    logError(error, 'getUserRank');
    throw error;
  }
};

export const getTopPerformers = async (category: string, limit: number = 3): Promise<LeaderboardEntry[]> => {
  try {
    const filter: LeaderboardFilter = {
      category: category as LeaderboardFilter['category'],
      limit
    };
    return getLeaderboard(filter);
  } catch (error) {
    logError(error, 'getTopPerformers');
    throw error;
  }
};

export const getTopUsers = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboard = await getLeaderboard();
    return leaderboard.slice(0, limit);
  } catch (error) {
    logError(error, 'getTopUsers');
    throw error;
  }
};

export const getTopAchievers = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    // TODO: Implement actual API call
    return [
      {
        userId: '1',
        username: 'User1',
        points: 1000,
        rank: 1,
        badges: [],
        level: 0
      },
      {
        userId: '2',
        username: 'User2',
        points: 900,
        rank: 2,
        badges: [],
        level: 0
      }
    ].slice(0, limit);
  } catch (error) {
    logError('Error fetching top achievers', error);
    throw error;
  }
}; 