// Import the Airtable client
import * as airtableClient from './mockClient';

// Types for rewards
export interface MemberReward {
  id: string;
  userId: string;
  points: number;
  level: string;
  badges: string[];
  lastUpdated: string;
}

export interface RewardActivity {
  id: string;
  userId: string;
  action: string;
  points: number;
  source: string; // 'BLKOUTNXT' or 'BLKOUTHUB'
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: string;
}

// Get a member's rewards
export const getMemberRewards = async (userId: string): Promise<MemberReward | null> => {
  try {
    const records = await airtableClient.getRecords('MemberRewards', {
      filterByFormula: `{userId} = '${userId}'`,
    });
    
    if (records.length === 0) {
      return null;
    }
    
    return records[0] as MemberReward;
  } catch (error) {
    console.error('Error fetching member rewards:', error);
    return null;
  }
};

// Get a member's reward activities
export const getMemberActivities = async (userId: string, limit = 10): Promise<RewardActivity[]> => {
  try {
    const records = await airtableClient.getRecords('RewardActivities', {
      filterByFormula: `{userId} = '${userId}'`,
      sort: [{ field: 'timestamp', direction: 'desc' }],
      maxRecords: limit,
    });
    
    return records as RewardActivity[];
  } catch (error) {
    console.error('Error fetching member activities:', error);
    return [];
  }
};

// Get all available badges
export const getAllBadges = async (): Promise<Badge[]> => {
  try {
    const records = await airtableClient.getRecords('Badges');
    return records as Badge[];
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

// Get a member's earned badges
export const getMemberBadges = async (userId: string): Promise<Badge[]> => {
  try {
    // First get the member's rewards to get the badge IDs
    const memberRewards = await getMemberRewards(userId);
    
    if (!memberRewards || !memberRewards.badges || memberRewards.badges.length === 0) {
      return [];
    }
    
    // Then get the badge details for each badge ID
    const badges = await Promise.all(
      memberRewards.badges.map(async (badgeId) => {
        try {
          const badge = await airtableClient.getRecord('Badges', badgeId);
          return badge as Badge;
        } catch (error) {
          console.error(`Error fetching badge ${badgeId}:`, error);
          return null;
        }
      })
    );
    
    return badges.filter((badge): badge is Badge => badge !== null);
  } catch (error) {
    console.error('Error fetching member badges:', error);
    return [];
  }
};

// Award points to a member
export const awardPoints = async (
  userId: string,
  points: number,
  action: string,
  source = 'BLKOUTNXT'
): Promise<RewardActivity> => {
  try {
    // Create the activity record
    const activity = await airtableClient.createRecord('RewardActivities', {
      userId,
      action,
      points,
      source,
      timestamp: new Date().toISOString(),
    });
    
    // Update the member's total points
    const memberRewards = await getMemberRewards(userId);
    
    if (memberRewards) {
      // Update existing rewards
      const newPoints = memberRewards.points + points;
      const newLevel = calculateLevel(newPoints);
      
      await airtableClient.updateRecord('MemberRewards', memberRewards.id, {
        points: newPoints,
        level: newLevel,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Create new rewards record
      await airtableClient.createRecord('MemberRewards', {
        userId,
        points,
        level: calculateLevel(points),
        badges: [],
        lastUpdated: new Date().toISOString(),
      });
    }
    
    return activity as RewardActivity;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
};

// Sync rewards with BLKOUTHUB
export const syncWithBlkoutHub = async (
  userId: string,
  blkoutHubPoints: number,
  blkoutHubActivities: { action: string; points: number; timestamp: string }[]
): Promise<void> => {
  try {
    // Get the member's current rewards
    const memberRewards = await getMemberRewards(userId);
    
    // Get existing activities from BLKOUTHUB to avoid duplicates
    const existingActivities = await airtableClient.getRecords('RewardActivities', {
      filterByFormula: `AND({userId} = '${userId}', {source} = 'BLKOUTHUB')`,
    }) as RewardActivity[];
    
    // Create new activities for each BLKOUTHUB activity that doesn't exist yet
    const existingTimestamps = existingActivities.map(activity => activity.timestamp);
    
    for (const activity of blkoutHubActivities) {
      if (!existingTimestamps.includes(activity.timestamp)) {
        await airtableClient.createRecord('RewardActivities', {
          userId,
          action: activity.action,
          points: activity.points,
          source: 'BLKOUTHUB',
          timestamp: activity.timestamp,
        });
      }
    }
    
    // Update the member's total points
    const localPoints = memberRewards?.points || 0;
    const totalPoints = Math.max(localPoints, blkoutHubPoints); // Use the higher value
    
    if (memberRewards) {
      // Update existing rewards
      await airtableClient.updateRecord('MemberRewards', memberRewards.id, {
        points: totalPoints,
        level: calculateLevel(totalPoints),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Create new rewards record
      await airtableClient.createRecord('MemberRewards', {
        userId,
        points: totalPoints,
        level: calculateLevel(totalPoints),
        badges: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error syncing with BLKOUTHUB:', error);
    throw error;
  }
};

// Award a badge to a member
export const awardBadge = async (userId: string, badgeId: string): Promise<void> => {
  try {
    // Get the member's current rewards
    const memberRewards = await getMemberRewards(userId);
    
    if (!memberRewards) {
      throw new Error('Member rewards not found');
    }
    
    // Check if the member already has this badge
    if (memberRewards.badges && memberRewards.badges.includes(badgeId)) {
      return; // Already has the badge
    }
    
    // Add the badge to the member's badges
    const updatedBadges = [...(memberRewards.badges || []), badgeId];
    
    await airtableClient.updateRecord('MemberRewards', memberRewards.id, {
      badges: updatedBadges,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// Helper function to calculate the level based on points
export const calculateLevel = (points: number): string => {
  if (points >= 1000) return 'Diamond';
  if (points >= 600) return 'Platinum';
  if (points >= 300) return 'Gold';
  if (points >= 100) return 'Silver';
  return 'Bronze';
};

// Helper function to calculate points needed for next level
export const pointsToNextLevel = (currentPoints: number): number => {
  if (currentPoints >= 1000) return 0; // Already at max level
  if (currentPoints >= 600) return 1000 - currentPoints; // Need for Diamond
  if (currentPoints >= 300) return 600 - currentPoints; // Need for Platinum
  if (currentPoints >= 100) return 300 - currentPoints; // Need for Gold
  return 100 - currentPoints; // Need for Silver
};

// Helper function to get the next level name
export const getNextLevel = (currentLevel: string): string => {
  switch (currentLevel) {
    case 'Bronze': return 'Silver';
    case 'Silver': return 'Gold';
    case 'Gold': return 'Platinum';
    case 'Platinum': return 'Diamond';
    default: return 'Silver';
  }
};