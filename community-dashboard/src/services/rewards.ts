import { logError } from './errorLogging';
import airtableClient from '../integrations/airtable/client';

/**
 * Types for the rewards system
 */

export interface RewardAction {
  id: string;
  name: string;
  description: string;
  pointValue: number;
  category: 'engagement' | 'content' | 'event' | 'feedback' | 'referral';
  isEnabled: boolean;
  requiresApproval: boolean;
  maxOccurrences: number | null; // null means unlimited
  cooldownPeriod: number | null; // in hours, null means no cooldown
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: string;
  badgeImageUrl: string;
  pointThreshold: number | null; // null if not point-based
  isHidden: boolean; // Whether to show before unlocked
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  category: 'engagement' | 'content' | 'event' | 'feedback' | 'referral' | 'special';
  createdAt: string;
  updatedAt: string;
}

export interface UserReward {
  id: string;
  userId: string;
  userName: string;
  currentPoints: number;
  lifetimePoints: number;
  level: number;
  achievements: {
    id: string;
    achievementId: string;
    unlockedAt: string;
  }[];
  recentActions: {
    id: string;
    actionId: string;
    timestamp: string;
    pointsEarned: number;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  rank: number;
  currentPoints: number;
  level: number;
  achievementCount: number;
}

/**
 * Get all available reward actions
 */
export const getRewardActions = async (): Promise<RewardAction[]> => {
  try {
    const records = await airtableClient.getRecords('RewardActions', {
      sort: [{ field: 'Category', direction: 'asc' }]
    });
    
    return records.map((record: any) => ({
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      pointValue: record.get('PointValue') as number,
      category: record.get('Category') as RewardAction['category'],
      isEnabled: record.get('IsEnabled') as boolean,
      requiresApproval: record.get('RequiresApproval') as boolean,
      maxOccurrences: record.get('MaxOccurrences') as number | null,
      cooldownPeriod: record.get('CooldownPeriod') as number | null,
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching reward actions');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get all achievements
 */
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const records = await airtableClient.getRecords('Achievements', {
      sort: [
        { field: 'Tier', direction: 'asc' },
        { field: 'Category', direction: 'asc' }
      ]
    });
    
    return records.map((record: any) => ({
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string,
      criteria: record.get('Criteria') as string,
      badgeImageUrl: record.get('BadgeImageUrl') as string,
      pointThreshold: record.get('PointThreshold') as number | null,
      isHidden: record.get('IsHidden') as boolean,
      tier: record.get('Tier') as Achievement['tier'],
      category: record.get('Category') as Achievement['category'],
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching achievements');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get user rewards by user ID
 */
export const getUserRewards = async (userId: string): Promise<UserReward | null> => {
  try {
    const records = await airtableClient.getRecords('UserRewards', {
      filterByFormula: `{UserId}='${userId}'`
    });
    
    if (records.length === 0) {
      return null;
    }
    
    const record = records[0];
    
    return {
      id: record.id,
      userId: record.get('UserId') as string,
      userName: record.get('UserName') as string,
      currentPoints: record.get('CurrentPoints') as number,
      lifetimePoints: record.get('LifetimePoints') as number,
      level: record.get('Level') as number,
      achievements: ((record.get('Achievements') || []) as any[]).map(achievement => ({
        id: achievement.id,
        achievementId: achievement.achievementId,
        unlockedAt: achievement.unlockedAt
      })),
      recentActions: ((record.get('RecentActions') || []) as any[]).map(action => ({
        id: action.id,
        actionId: action.actionId,
        timestamp: action.timestamp,
        pointsEarned: action.pointsEarned,
        notes: action.notes
      })),
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error fetching user rewards for user ${userId}`);
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get the community leaderboard
 */
export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const records = await airtableClient.getRecords('UserRewards', {
      sort: [{ field: 'CurrentPoints', direction: 'desc' }],
      maxRecords: limit
    });
    
    return records.map((record: any, index: number) => ({
      userId: record.get('UserId') as string,
      userName: record.get('UserName') as string,
      rank: index + 1,
      currentPoints: record.get('CurrentPoints') as number,
      level: record.get('Level') as number,
      achievementCount: ((record.get('Achievements') || []) as any[]).length
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching leaderboard');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Award points to a user
 */
export const awardPoints = async (
  userId: string, 
  actionId: string, 
  notes?: string
): Promise<UserReward> => {
  try {
    // Get the action to determine point value
    const actions = await getRewardActions();
    const action = actions.find(a => a.id === actionId);
    
    if (!action) {
      throw new Error(`Reward action ${actionId} not found`);
    }
    
    if (!action.isEnabled) {
      throw new Error(`Reward action ${action.name} is disabled`);
    }
    
    // Get current user rewards
    const userRewards = await getUserRewards(userId);
    
    if (!userRewards) {
      throw new Error(`User ${userId} not found in rewards system`);
    }
    
    // Check for cooldown if applicable
    if (action.cooldownPeriod !== null) {
      const recentSameAction = userRewards.recentActions.find(ra => ra.actionId === actionId);
      
      if (recentSameAction) {
        const actionTime = new Date(recentSameAction.timestamp).getTime();
        const now = new Date().getTime();
        const hoursSince = (now - actionTime) / (1000 * 60 * 60);
        
        if (hoursSince < action.cooldownPeriod) {
          throw new Error(`Action ${action.name} is on cooldown for another ${Math.ceil(action.cooldownPeriod - hoursSince)} hours`);
        }
      }
    }
    
    // Check for max occurrences if applicable
    if (action.maxOccurrences !== null) {
      const occurrences = userRewards.recentActions.filter(ra => ra.actionId === actionId).length;
      
      if (occurrences >= action.maxOccurrences) {
        throw new Error(`Maximum occurrences (${action.maxOccurrences}) reached for action ${action.name}`);
      }
    }
    
    // Create new action record
    const newAction = {
      id: `action_${Date.now()}`,
      actionId,
      timestamp: new Date().toISOString(),
      pointsEarned: action.pointValue,
      notes
    };
    
    // Update user rewards
    const updatedCurrentPoints = userRewards.currentPoints + action.pointValue;
    const updatedLifetimePoints = userRewards.lifetimePoints + action.pointValue;
    const updatedRecentActions = [newAction, ...userRewards.recentActions].slice(0, 50); // Keep last 50 actions
    const updatedDate = new Date().toISOString();
    
    // Check if any new achievements should be unlocked
    const achievements = await getAchievements();
    const newAchievements = achievements.filter(achievement => 
      // Only check point-based achievements
      achievement.pointThreshold !== null &&
      // User doesn't already have this achievement
      !userRewards.achievements.some(ua => ua.achievementId === achievement.id) &&
      // User has enough points
      updatedLifetimePoints >= achievement.pointThreshold
    );
    
    // Add any new achievements
    const achievementsToAdd = newAchievements.map(achievement => ({
      id: `ach_${Date.now()}_${achievement.id}`,
      achievementId: achievement.id,
      unlockedAt: new Date().toISOString()
    }));
    
    const updatedAchievements = [...userRewards.achievements, ...achievementsToAdd];
    
    // Update user level based on points
    const newLevel = Math.floor(Math.sqrt(updatedLifetimePoints / 100)) + 1;
    
    // Update in Airtable
    await airtableClient.updateRecord('UserRewards', userRewards.id, {
      CurrentPoints: updatedCurrentPoints,
      LifetimePoints: updatedLifetimePoints,
      Level: newLevel,
      Achievements: updatedAchievements,
      RecentActions: updatedRecentActions,
      UpdatedAt: updatedDate
    });
    
    // Return the updated user rewards
    const result: UserReward = {
      ...userRewards,
      currentPoints: updatedCurrentPoints,
      lifetimePoints: updatedLifetimePoints,
      level: newLevel,
      achievements: updatedAchievements,
      recentActions: updatedRecentActions,
      updatedAt: updatedDate
    };
    
    return result;
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error awarding points');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Initialize a new user in the rewards system
 */
export const initializeUserRewards = async (
  userId: string, 
  userName: string
): Promise<UserReward> => {
  try {
    // Check if user already exists
    const existingUser = await getUserRewards(userId);
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create new user rewards record
    const now = new Date().toISOString();
    const newUserRewards = {
      UserId: userId,
      UserName: userName,
      CurrentPoints: 0,
      LifetimePoints: 0,
      Level: 1,
      Achievements: [],
      RecentActions: [],
      CreatedAt: now,
      UpdatedAt: now
    };
    
    const record = await airtableClient.createRecord('UserRewards', newUserRewards);
    
    return {
      id: record.id,
      userId,
      userName,
      currentPoints: 0,
      lifetimePoints: 0,
      level: 1,
      achievements: [],
      recentActions: [],
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error initializing rewards for user ${userId}`);
    logError(errorObj);
    throw errorObj;
  }
};

// Export the service functions
const rewardsService = {
  getRewardActions,
  getAchievements,
  getUserRewards,
  getLeaderboard,
  awardPoints,
  initializeUserRewards
};

export default rewardsService;