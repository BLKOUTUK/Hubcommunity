/**
 * Heartbeat.chat API Client for BLKOUTHUB integration
 * 
 * This client handles communication with the Heartbeat.chat API to access BLKOUTHUB data
 * and synchronize member rewards, points, and activities.
 */

import { logError } from '../../services/errorLogging';

// Environment variables for Heartbeat configuration
const heartbeatApiKey = import.meta.env.VITE_HEARTBEAT_API_KEY;
const heartbeatApiUrl = import.meta.env.VITE_HEARTBEAT_API_URL || 'https://api.heartbeat.chat/v1';
const heartbeatWebhookSecret = import.meta.env.VITE_HEARTBEAT_WEBHOOK_SECRET;

// Check if required environment variables are set
if (!heartbeatApiKey) {
  console.warn('Missing Heartbeat API key. Check your .env file. Mock client will be used in development.');
}

// User type definition
export interface HeartbeatUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
}

// Badge/achievement type definition
export interface HeartbeatBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  awardedAt: string;
}

// Activity type definition
export interface HeartbeatActivity {
  id: string;
  userId: string;
  type: string;
  description: string;
  points: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Reward summary type definition
export interface HeartbeatRewardSummary {
  userId: string;
  points: number;
  level: string;
  badges: HeartbeatBadge[];
  activities: HeartbeatActivity[];
}

// Webhook type definition
export interface HeartbeatWebhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
}

// Event type definition
export interface HeartbeatEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  imageUrl?: string;
}

/**
 * Heartbeat API Client class
 */
class HeartbeatClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = heartbeatApiKey, baseUrl: string = heartbeatApiUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request to the Heartbeat API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Heartbeat API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      return result as T;
    } catch (error) {
      logError(`Heartbeat API request failed: ${endpoint}`, { method, error });
      throw error;
    }
  }

  /**
   * Get user information from BLKOUTHUB
   */
  async getUser(userId: string): Promise<HeartbeatUser> {
    return this.request<HeartbeatUser>(`/users/${userId}`);
  }

  /**
   * Get user rewards and points from BLKOUTHUB
   */
  async getUserRewards(userId: string): Promise<HeartbeatRewardSummary> {
    return this.request<HeartbeatRewardSummary>(`/users/${userId}/rewards`);
  }

  /**
   * Get user activities from BLKOUTHUB
   */
  async getUserActivities(userId: string): Promise<HeartbeatActivity[]> {
    return this.request<HeartbeatActivity[]>(`/users/${userId}/activities`);
  }

  /**
   * Sync user points with BLKOUTHUB
   */
  async syncUserPoints(userId: string, points: number, source: string): Promise<void> {
    await this.request<void>(`/users/${userId}/points/sync`, 'POST', {
      points,
      source,
    });
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
    return this.request<HeartbeatActivity>(`/users/${userId}/points/award`, 'POST', {
      points,
      description,
      metadata,
    });
  }

  /**
   * Sync an event with BLKOUTHUB
   * @param eventData Event data to sync
   */
  async syncEvent(eventData: any): Promise<void> {
    await this.request<void>('/events/sync', 'POST', eventData);
  }

  /**
   * Get events from BLKOUTHUB
   */
  async getEvents(limit: number = 10, offset: number = 0): Promise<HeartbeatEvent[]> {
    return this.request<HeartbeatEvent[]>(`/events?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get a specific event
   */
  async getEvent(eventId: string): Promise<HeartbeatEvent> {
    return this.request<HeartbeatEvent>(`/events/${eventId}`);
  }

  /**
   * Create a webhook to receive notifications from BLKOUTHUB
   */
  async createWebhook(webhook: Omit<HeartbeatWebhook, 'id' | 'status'>): Promise<HeartbeatWebhook> {
    return this.request<HeartbeatWebhook>('/webhooks', 'POST', webhook);
  }

  /**
   * Verify a webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    // In a real implementation, this would verify the HMAC signature
    // using the webhook secret
    return true;
  }

  /**
   * Get top contributors for a given time period
   * @param period The time period ('day', 'week', 'month', 'year')
   */
  async getTopContributors(period: string): Promise<{
    userId: string;
    name: string;
    avatarUrl: string;
    points: number;
    activities: number;
  }[]> {
    return this.request<{
      userId: string;
      name: string;
      avatarUrl: string;
      points: number;
      activities: number;
    }[]>(`/top-contributors?period=${period}`);
  }

  /**
   * Award a badge to a user
   * @param userId The user's ID
   * @param badgeId The badge ID
   * @param badgeName The badge name
   * @param badgeDescription The badge description
   */
  async awardBadge(userId: string, badgeId: string, badgeName: string, badgeDescription: string): Promise<void> {
    await this.request<void>(`/users/${userId}/badges/${badgeId}/award`, 'POST');
  }
}

// Export a singleton instance of the client
export const heartbeatClient = new HeartbeatClient();