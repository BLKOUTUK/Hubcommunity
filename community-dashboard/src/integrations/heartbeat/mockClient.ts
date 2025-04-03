/**
 * Mock Heartbeat API Client for BLKOUTHUB integration
 * 
 * This mock client is used during development when no real API key is provided.
 * It returns consistent test data without making real API requests.
 */

import {
  HeartbeatUser,
  HeartbeatBadge,
  HeartbeatActivity,
  HeartbeatRewardSummary,
  HeartbeatEvent,
  HeartbeatWebhook
} from './client';

/**
 * Mock implementation of the Heartbeat client
 */
class HeartbeatMockClient {
  // Sample user data
  private mockUser: HeartbeatUser = {
    id: 'mock-user-123',
    username: 'demo_user',
    displayName: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
    createdAt: '2023-01-15T08:30:00Z',
    lastActive: new Date().toISOString()
  };

  // Sample badges data
  private mockBadges: HeartbeatBadge[] = [
    {
      id: 'badge-1',
      name: 'Welcome',
      description: 'Joined the BLKOUTHUB community',
      imageUrl: 'https://via.placeholder.com/64',
      criteria: 'Join the community',
      awardedAt: '2023-01-15T09:00:00Z'
    },
    {
      id: 'badge-2',
      name: 'Contributor',
      description: 'Made a valuable contribution to the community',
      imageUrl: 'https://via.placeholder.com/64',
      criteria: 'Create 5 posts',
      awardedAt: '2023-02-10T14:20:00Z'
    },
    {
      id: 'badge-3',
      name: 'Event Enthusiast',
      description: 'Attended multiple community events',
      imageUrl: 'https://via.placeholder.com/64',
      criteria: 'Attend 3 events',
      awardedAt: '2023-03-25T18:45:00Z'
    }
  ];

  // Sample activities data
  private mockActivities: HeartbeatActivity[] = [
    {
      id: 'activity-1',
      userId: 'mock-user-123',
      type: 'post',
      description: 'Created a discussion post in BLKOUTHUB',
      points: 15,
      timestamp: '2023-02-05T10:15:00Z',
      metadata: {
        postId: 'post-123',
        title: 'Discussion about community events'
      }
    },
    {
      id: 'activity-2',
      userId: 'mock-user-123',
      type: 'comment',
      description: 'Commented on a community post in BLKOUTHUB',
      points: 5,
      timestamp: '2023-02-10T14:20:00Z',
      metadata: {
        postId: 'post-456',
        commentId: 'comment-789'
      }
    },
    {
      id: 'activity-3',
      userId: 'mock-user-123',
      type: 'event_rsvp',
      description: 'RSVP\'d to a community event in BLKOUTHUB',
      points: 10,
      timestamp: '2023-03-01T09:30:00Z',
      metadata: {
        eventId: 'event-101',
        eventName: 'Community Meetup'
      }
    },
    {
      id: 'activity-4',
      userId: 'mock-user-123',
      type: 'resource_share',
      description: 'Shared a resource in BLKOUTHUB',
      points: 20,
      timestamp: '2023-03-15T16:00:00Z',
      metadata: {
        resourceId: 'resource-202',
        resourceTitle: 'Community Building Guide'
      }
    }
  ];

  // Sample events data
  private mockEvents: HeartbeatEvent[] = [
    {
      id: 'event-101',
      title: 'Community Meetup',
      description: 'Monthly community gathering to discuss projects and ideas',
      startDate: '2023-04-15T18:00:00Z',
      endDate: '2023-04-15T20:00:00Z',
      location: 'Community Center',
      imageUrl: 'https://via.placeholder.com/300x200'
    },
    {
      id: 'event-102',
      title: 'Workshop: Building Inclusive Communities',
      description: 'Learn strategies for creating more inclusive community spaces',
      startDate: '2023-04-22T15:00:00Z',
      endDate: '2023-04-22T17:30:00Z',
      location: 'Online via Zoom',
      imageUrl: 'https://via.placeholder.com/300x200'
    }
  ];

  /**
   * Get user information from BLKOUTHUB
   */
  async getUser(userId: string): Promise<HeartbeatUser> {
    console.log(`[MOCK] Getting user: ${userId}`);
    // Return our mock user with the requested userId
    return { ...this.mockUser, id: userId };
  }

  /**
   * Get user rewards and points from BLKOUTHUB
   */
  async getUserRewards(userId: string): Promise<HeartbeatRewardSummary> {
    console.log(`[MOCK] Getting rewards for user: ${userId}`);
    return {
      userId,
      points: 150,
      level: 'Active',
      badges: this.mockBadges,
      activities: this.mockActivities
    };
  }

  /**
   * Get user activities from BLKOUTHUB
   */
  async getUserActivities(userId: string): Promise<HeartbeatActivity[]> {
    console.log(`[MOCK] Getting activities for user: ${userId}`);
    return this.mockActivities;
  }

  /**
   * Sync user points with BLKOUTHUB
   */
  async syncUserPoints(userId: string, points: number, source: string): Promise<void> {
    console.log(`[MOCK] Syncing points for user ${userId}: ${points} points from ${source}`);
    // Mock implementation, do nothing
    return;
  }

  /**
   * Award points to a user
   */
  async awardPoints(
    userId: string,
    points: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<HeartbeatActivity> {
    console.log(`[MOCK] Awarding ${points} points to user ${userId}: ${description}`);
    
    const newActivity: HeartbeatActivity = {
      id: `activity-${Date.now()}`,
      userId,
      type: 'custom',
      description,
      points,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // Add to our mock activities
    this.mockActivities.push(newActivity);
    
    return newActivity;
  }

  /**
   * Get events from BLKOUTHUB
   */
  async getEvents(limit: number = 10, offset: number = 0): Promise<HeartbeatEvent[]> {
    console.log(`[MOCK] Getting events: limit=${limit}, offset=${offset}`);
    return this.mockEvents.slice(offset, offset + limit);
  }

  /**
   * Get a specific event
   */
  async getEvent(eventId: string): Promise<HeartbeatEvent> {
    console.log(`[MOCK] Getting event: ${eventId}`);
    const event = this.mockEvents.find(e => e.id === eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }
    return event;
  }

  /**
   * Create a webhook to receive notifications from BLKOUTHUB
   */
  async createWebhook(webhook: Omit<HeartbeatWebhook, 'id' | 'status'>): Promise<HeartbeatWebhook> {
    console.log(`[MOCK] Creating webhook for URL: ${webhook.url}`);
    return {
      id: `webhook-${Date.now()}`,
      url: webhook.url,
      events: webhook.events,
      status: 'active'
    };
  }

  /**
   * Verify a webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    // Mock implementation always returns true
    return true;
  }
}

// Export a singleton instance
export const heartbeatMockClient = new HeartbeatMockClient();