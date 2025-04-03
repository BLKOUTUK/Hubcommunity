/**
 * BLKOUTHUB Rewards Service
 *
 * This service integrates with BLKOUTHUB via Heartbeat.chat API to sync and manage
 * member rewards across platforms.
 */

import { heartbeatClient, HeartbeatRewardSummary, HeartbeatActivity, HeartbeatBadge } from './client';
import { logError, logInfo } from '../../services/errorLogging';

// Mapping between Heartbeat levels and our application levels
const LEVEL_MAPPING: Record<string, string> = {
  'Newcomer': 'Bronze',
  'Regular': 'Silver',
  'Active': 'Gold',
  'Champion': 'Platinum'
};

// Reverse mapping for syncing our levels to Heartbeat
const REVERSE_LEVEL_MAPPING: Record<string, string> = {
  'Bronze': 'Newcomer',
  'Silver': 'Regular',
  'Gold': 'Active',
  'Platinum': 'Champion'
};

// Interface for BlkoutHub rewards
export interface BlkoutHubRewards {
  points: number;
  level: string;
  badges: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    awardedAt: string;
  }[];
  activities: {
    id: string;
    type: string;
    description: string;
    points: number;
    timestamp: string;
  }[];
}

// Map Heartbeat rewards to our application format
function mapHeartbeatRewardsToBlkout(rewards: HeartbeatRewardSummary): BlkoutHubRewards {
  return {
    points: rewards.points,
    level: LEVEL_MAPPING[rewards.level] || 'Bronze',
    badges: rewards.badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      awardedAt: badge.awardedAt
    })),
    activities: rewards.activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      points: activity.points,
      timestamp: activity.timestamp
    }))
  };
}

/**
 * Get a user's rewards from BLKOUTHUB
 * @param userId The user's ID
 * @returns The user's rewards or null if there was an error
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
 * @param points The user's current points
 * @param level The user's current level
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
 * @param description A description of the activity
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

// Member of the Month configuration
interface MemberOfTheMonth {
  userId: string;
  name: string;
  avatarUrl: string;
  points: number;
  activities: number;
  awardedAt: string;
  specialBadge: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

// Level progression configuration
const LEVEL_CONFIG = {
  Bronze: {
    points: 0,
    benefits: ['Access to basic community features', 'Monthly newsletter'],
    badge: {
      id: 'bronze',
      name: 'Bronze Member',
      description: 'Welcome to the community!',
      imageUrl: '/badges/bronze.png'
    }
  },
  Silver: {
    points: 100,
    benefits: ['Access to member-only events', 'Early event registration', 'Community forum access'],
    badge: {
      id: 'silver',
      name: 'Silver Member',
      description: 'Active community contributor',
      imageUrl: '/badges/silver.png'
    }
  },
  Gold: {
    points: 300,
    benefits: ['VIP event access', 'Mentorship opportunities', 'Community spotlight features'],
    badge: {
      id: 'gold',
      name: 'Gold Member',
      description: 'Community leader and mentor',
      imageUrl: '/badges/gold.png'
    }
  },
  Platinum: {
    points: 600,
    benefits: ['Exclusive networking events', 'Speaking opportunities', 'Community advisory role'],
    badge: {
      id: 'platinum',
      name: 'Platinum Member',
      description: 'Community champion and advisor',
      imageUrl: '/badges/platinum.png'
    }
  }
};

/**
 * Get the current Member of the Month
 */
export async function getMemberOfTheMonth(): Promise<MemberOfTheMonth | null> {
  try {
    // Get top contributors for the current month
    const topContributors = await heartbeatClient.getTopContributors('month');
    if (!topContributors.length) return null;

    const topMember = topContributors[0];
    
    return {
      userId: topMember.userId,
      name: topMember.name,
      avatarUrl: topMember.avatarUrl,
      points: topMember.points,
      activities: topMember.activities,
      awardedAt: new Date().toISOString(),
      specialBadge: {
        id: 'motm',
        name: 'Member of the Month',
        description: `Recognized as the most active community member for ${new Date().toLocaleString('default', { month: 'long' })}`,
        imageUrl: '/badges/motm.png'
      }
    };
  } catch (error) {
    logError('Failed to fetch Member of the Month', { error });
    return null;
  }
}

/**
 * Get level progression information
 */
export function getLevelProgression(currentPoints: number) {
  const levels = Object.entries(LEVEL_CONFIG);
  let currentLevel = 'Bronze';
  let nextLevel = 'Silver';
  let pointsToNext = LEVEL_CONFIG.Silver.points;

  for (let i = 0; i < levels.length - 1; i++) {
    const [level, config] = levels[i];
    const [nextLevelName, nextConfig] = levels[i + 1];
    
    if (currentPoints >= config.points && currentPoints < nextConfig.points) {
      currentLevel = level;
      nextLevel = nextLevelName;
      pointsToNext = nextConfig.points - currentPoints;
      break;
    }
  }

  return {
    currentLevel,
    nextLevel,
    pointsToNext,
    currentBenefits: LEVEL_CONFIG[currentLevel as keyof typeof LEVEL_CONFIG].benefits,
    nextBenefits: LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG].benefits,
    progress: Math.min(100, Math.round((currentPoints / LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG].points) * 100))
  };
}

/**
 * Check for level up and handle celebration
 */
export async function checkLevelUp(userId: string, currentPoints: number): Promise<boolean> {
  const { currentLevel, nextLevel } = getLevelProgression(currentPoints);
  
  // Check if user has enough points for next level
  if (currentPoints >= LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG].points) {
    try {
      // Award level badge
      const levelBadge = LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG].badge;
      await heartbeatClient.awardBadge(userId, levelBadge.id, levelBadge.name, levelBadge.description);
      
      // Log level up event
      logInfo('User leveled up', { userId, fromLevel: currentLevel, toLevel: nextLevel });
      
      return true;
    } catch (error) {
      logError('Failed to process level up', { userId, currentLevel, nextLevel, error });
      return false;
    }
  }
  
  return false;
}