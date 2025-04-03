/**
 * BLKOUTHUB Rewards Service
 * 
 * This service integrates with BLKOUTHUB via Heartbeat.chat API to sync and manage
 * member rewards across platforms.
 */

import { heartbeatClient, HeartbeatRewardSummary, HeartbeatActivity, HeartbeatBadge } from './client';
import { logError, logInfo } from '@/services/errorLogging';

// Map Heartbeat reward levels to our application's reward levels
const LEVEL_MAPPING = {
  'Newcomer': 'Bronze',
  'Regular': 'Silver',
  'Contributor': 'Gold',
  'Leader': 'Platinum',
  'Champion': 'Diamond'
};

// Map our application's reward levels to Heartbeat levels
const REVERSE_LEVEL_MAPPING = Object.entries(LEVEL_MAPPING).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }), 
  {} as Record<string, string>
);

export interface BlkoutHubRewards {
  points: number;
  level: string;
  nextLevel: string;
  pointsToNextLevel: number;
  recentActivities: {
    action: string;
    points: number;
    date: string;
  }[];
  badges: {
    name: string;
    description: string;
    imageUrl: string;
    earnedAt: string;
  }[];
}

/**
 * Get a user's rewards from BLKOUTHUB
 * @param userId The user's ID
 * @returns The user's rewards information
 */
export async function getBlkoutHubRewards(userId: string): Promise<BlkoutHubRewards | null> {
  try {
    const rewardSummary = await heartbeatClient.getUserRewards(userId);
    return mapHeartbeatRewardsToBlkout(rewardSummary);
  } catch (error) {
    logError('Failed to fetch BLKOUTHUB rewards', { userId, error });
    return null;
  }
}

/**
 * Sync a user's rewards between our platform and BLKOUTHUB
 * @param userId The user's ID
 * @param points The user's current points in our platform
 * @param level The user's current level in our platform
 */
export async function syncRewardsWithBlkoutHub(
  userId: string, 
  points: number, 
  level: string
): Promise<void> {
  try {
    // Convert our level to Heartbeat level
    const heartbeatLevel = REVERSE_LEVEL_MAPPING[level] || 'Newcomer';
    
    // Sync points to BLKOUTHUB
    await heartbeatClient.syncUserPoints(userId, points, 'community-dashboard');
    
    logInfo('Synced rewards with BLKOUTHUB', { userId, points, level, heartbeatLevel });
  } catch (error) {
    logError('Failed to sync rewards with BLKOUTHUB', { userId, points, level, error });
  }
}

/**
 * Award points to a user for an activity and sync with BLKOUTHUB
 * @param userId The user's ID
 * @param points The points to award
 * @param description Description of the activity
 * @param metadata Additional metadata about the activity
 */
export async function awardPointsAndSync(
  userId: string,
  points: number,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Award points in BLKOUTHUB
    await heartbeatClient.awardPoints(userId, points, description, metadata);
    
    logInfo('Awarded points and synced with BLKOUTHUB', { 
      userId, points, description, metadata 
    });
  } catch (error) {
    logError('Failed to award points in BLKOUTHUB', { 
      userId, points, description, metadata, error 
    });
  }
}

/**
 * Map Heartbeat rewards to our application's format
 */
function mapHeartbeatRewardsToBlkout(rewardSummary: HeartbeatRewardSummary): BlkoutHubRewards {
  return {
    points: rewardSummary.totalPoints,
    level: LEVEL_MAPPING[rewardSummary.level] || 'Bronze',
    nextLevel: LEVEL_MAPPING[rewardSummary.nextLevel] || 'Silver',
    pointsToNextLevel: rewardSummary.pointsToNextLevel,
    recentActivities: rewardSummary.recentActivities.map(activity => ({
      action: activity.description,
      points: activity.points,
      date: formatDate(activity.timestamp)
    })),
    badges: rewardSummary.badges.map(badge => ({
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      earnedAt: formatDate(badge.earnedAt)
    }))
  };
}

/**
 * Format a date string to a relative time (e.g., "2 days ago")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}