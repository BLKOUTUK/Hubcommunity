/**
 * Heartbeat API Client
 * 
 * This client provides methods to interact with the Heartbeat API for community integration.
 * It handles authentication, user data retrieval, and webhook management.
 */

// Environment variables for Heartbeat configuration
const heartbeatApiKey = import.meta.env.VITE_HEARTBEAT_API_KEY;
const heartbeatApiUrl = import.meta.env.VITE_HEARTBEAT_API_URL || 'https://api.heartbeat.chat/v0';

// Check if required environment variables are set
if (!heartbeatApiKey) {
  console.error('Missing Heartbeat API key. Check your .env file.');
}

/**
 * Base Heartbeat API client with authentication and request handling
 */
class HeartbeatClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = heartbeatApiKey, baseUrl: string = heartbeatApiUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Make an authenticated request to the Heartbeat API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
    };

    if (data && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Heartbeat API error (${response.status}): ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Error in Heartbeat API request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get a user by their ID
   */
  async getUser(userId: string) {
    return this.request<HeartbeatUser>(`/users/${userId}`);
  }

  /**
   * Get a user by their email
   */
  async getUserByEmail(email: string) {
    return this.request<HeartbeatUser>(`/find/users?email=${encodeURIComponent(email)}`);
  }

  /**
   * Get all users in the community
   */
  async getAllUsers() {
    return this.request<HeartbeatUser[]>('/users');
  }

  /**
   * Get all events in the community
   */
  async getAllEvents() {
    return this.request<HeartbeatEvent[]>('/events');
  }

  /**
   * Get a specific event by ID
   */
  async getEvent(eventId: string) {
    return this.request<HeartbeatEvent>(`/events/${eventId}`);
  }

  /**
   * Get event attendance
   */
  async getEventAttendance(eventId: string) {
    return this.request<HeartbeatEventAttendance[]>(`/events/${eventId}/attendance`);
  }

  /**
   * Create a webhook subscription
   */
  async createWebhook(webhookData: HeartbeatWebhookCreate) {
    return this.request<HeartbeatWebhook>('/webhooks', 'POST', webhookData);
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhook(webhookId: string) {
    return this.request<{ success: boolean }>(`/webhooks/${webhookId}`, 'DELETE');
  }

  /**
   * List all webhook subscriptions
   */
  async listWebhooks() {
    return this.request<HeartbeatWebhook[]>('/webhooks');
  }

  /**
   * Get a user's rewards information
   */
  async getUserRewards(userId: string) {
    return this.request<HeartbeatRewardSummary>(`/users/${userId}/rewards`);
  }

  /**
   * Sync user points between platforms
   */
  async syncUserPoints(userId: string, points: number, source: string) {
    return this.request<{ success: boolean }>(`/users/${userId}/points/sync`, 'POST', {
      points,
      source,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Award points to a user for an activity
   */
  async awardPoints(userId: string, points: number, description: string, metadata?: Record<string, any>) {
    return this.request<HeartbeatActivity>(`/users/${userId}/points`, 'POST', {
      points,
      description,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Types for Heartbeat API responses
 */

export interface HeartbeatUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  lastActive?: string;
  roles: string[];
  metadata?: Record<string, any>;
}

export interface HeartbeatEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}

export interface HeartbeatEventAttendance {
  userId: string;
  eventId: string;
  status: 'going' | 'not_going' | 'maybe';
  joinedAt?: string;
}

export interface HeartbeatWebhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface HeartbeatWebhookCreate {
  url: string;
  events: string[];
  secret?: string;
  filter?: Record<string, any>;
}

export interface HeartbeatRewardSummary {
  totalPoints: number;
  level: string;
  nextLevel: string;
  pointsToNextLevel: number;
  badges: HeartbeatBadge[];
  recentActivities: HeartbeatActivity[];
}

export interface HeartbeatActivity {
  id: string;
  userId: string;
  description: string;
  points: number;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface HeartbeatBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: string;
  earnedAt: string;
}

// Export a singleton instance of the client
export const heartbeatClient = new HeartbeatClient();

// Export the class for testing or custom instantiation
export default HeartbeatClient;