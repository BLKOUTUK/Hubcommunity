/**
 * Mock Heartbeat API Client for BLKOUTHUB integration
 * 
 * This mock client provides test data for development and testing environments.
 */

import { HeartbeatUser, HeartbeatBadge, HeartbeatActivity, HeartbeatRewardSummary } from './client';

// Mock badges
const mockBadges: HeartbeatBadge[] = [
  {
    id: 'badge-1',
    name: 'Community Connector',
    description: 'Connected with 10+ community members',
    imageUrl: 'https://blkouthub.com/badges/connector.png',
    requirements: 'Connect with 10 or more community members',
    earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: 'badge-2',
    name: 'Resource Contributor',
    description: 'Shared valuable resources with the community',
    imageUrl: 'https://blkouthub.com/badges/contributor.png',
    requirements: 'Share at least 3 resources with the community',
    earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: 'badge-3',
    name: 'Event Participant',
    description: 'Attended 5+ community events',
    imageUrl: 'https://blkouthub.com/badges/participant.png',
    requirements: 'Attend 5 or more community events',
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
];

// Mock activities
const mockActivities: HeartbeatActivity[] = [
  {
    id: 'activity-1',
    type: 'post',
    description: 'Created a discussion post in BLKOUTHUB',
    points: 15,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    userId: 'user-1',
    metadata: {
      postId: 'post-123',
      title: 'Mental Health Resources for Black Queer Men',
    },
  },
  {
    id: 'activity-2',
    type: 'comment',
    description: 'Commented on a community post in BLKOUTHUB',
    points: 5,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    userId: 'user-1',
    metadata: {
      postId: 'post-456',
      commentId: 'comment-789',
    },
  },
  {
    id: 'activity-3',
    type: 'event_rsvp',
    description: 'RSVP\'d to a community event in BLKOUTHUB',
    points: 10,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    userId: 'user-1',
    metadata: {
      eventId: 'event-123',
      eventName: 'Professional Networking Mixer',
    },
  },
  {
    id: 'activity-4',
    type: 'resource_share',
    description: 'Shared a resource in BLKOUTHUB',
    points: 20,
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    userId: 'user-1',
    metadata: {
      resourceId: 'resource-123',
      resourceType: 'article',
      title: 'Career Development for QTIPOC Professionals',
    },
  },
];

// Mock user data
const mockUser: HeartbeatUser = {
  id: 'user-1',
  email: 'marcus.johnson@example.com',
  name: 'Marcus Johnson',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  bio: 'Community advocate and professional mentor. Passionate about creating spaces for Black queer men to thrive.',
  joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
  lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  roles: ['member', 'contributor'],
  metadata: {
    badges: mockBadges.map(badge => badge.id),
    points: 175
  }
};

// Mock reward summary
const mockRewardSummary: HeartbeatRewardSummary = {
  totalPoints: 175,
  level: 'Regular',
  nextLevel: 'Contributor',
  pointsToNextLevel: 125,
  recentActivities: mockActivities,
  badges: mockBadges,
};

class HeartbeatMockClient {
  /**
   * Get user information from BLKOUTHUB
   */
  async getUser(userId: string): Promise<HeartbeatUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockUser, id: userId };
  }

  /**
   * Get user rewards and points from BLKOUTHUB
   */
  async getUserRewards(userId: string): Promise<HeartbeatRewardSummary> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockRewardSummary };
  }

  /**
   * Get user activities from BLKOUTHUB
   */
  async getUserActivities(userId: string, limit = 10): Promise<HeartbeatActivity[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockActivities.slice(0, limit).map(activity => ({
      ...activity,
      userId,
    }));
  }

  /**
   * Sync a user's points between platforms
   */
  async syncUserPoints(userId: string, points: number, source: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[MOCK] Synced ${points} points for user ${userId} from ${source}`);
  }

  /**
   * Award points to a user for an activity
   */
  async awardPoints(userId: string, points: number, description: string, metadata?: Record<string, any>): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[MOCK] Awarded ${points} points to user ${userId} for: ${description}`);
  }
}

// Export a singleton instance
export const heartbeatMockClient = new HeartbeatMockClient();