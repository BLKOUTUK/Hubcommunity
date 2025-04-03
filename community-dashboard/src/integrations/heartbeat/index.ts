/**
 * BLKOUTHUB Integration via Heartbeat.chat
 * 
 * This module enables integration between the Community Dashboard and BLKOUTHUB
 * through the Heartbeat.chat API.
 */

import { logError, logInfo } from '../../services/errorLogging';

// Environment variables
// @ts-ignore - Vite provides import.meta.env
const API_KEY = import.meta.env.VITE_HEARTBEAT_API_KEY || '';
// @ts-ignore - Vite provides import.meta.env
const API_URL = import.meta.env.VITE_HEARTBEAT_API_URL || 'https://api.heartbeat.chat/v1';
// @ts-ignore - Vite provides import.meta.env
const COMMUNITY_ID = import.meta.env.VITE_HEARTBEAT_COMMUNITY_ID || '';
// @ts-ignore - Vite provides import.meta.env
const WEBHOOK_SECRET = import.meta.env.VITE_HEARTBEAT_WEBHOOK_SECRET || '';

// Check if Heartbeat API is properly configured
const isConfigValid = !!(API_KEY && API_URL && COMMUNITY_ID);

/**
 * Check if BLKOUTHUB integration is enabled
 * @returns boolean indicating if integration is enabled
 */
export const isBlkoutHubEnabled = (): boolean => {
  return isConfigValid;
};

/**
 * Generic API request function with retry logic
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param data Request data
 * @returns API response
 */
const apiRequest = async (endpoint: string, method = 'GET', data?: any): Promise<any> => {
  // If configuration is invalid, use mock data
  if (!isConfigValid) {
    logInfo('Using mock data for Heartbeat', { endpoint, method });
    return getMockData(endpoint, method, data);
  }

  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Heartbeat API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Heartbeat API error: ${errorMessage}`, { endpoint, method });
    throw error;
  }
};

/**
 * Get a user's rewards from BLKOUTHUB
 * @param userId User ID
 * @returns User rewards
 */
export const getBlkoutHubRewards = async (userId: string): Promise<any> => {
  try {
    const response = await apiRequest(`/communities/${COMMUNITY_ID}/members/${userId}/rewards`);
    return response;
  } catch (error) {
    logError('Failed to get BLKOUTHUB rewards', { userId, error });
    throw error;
  }
};

/**
 * Sync rewards between platforms
 * @param userId User ID
 * @param points Points to sync
 * @param level Level to sync
 */
export const syncRewardsWithBlkoutHub = async (
  userId: string,
  points: number,
  level: string
): Promise<any> => {
  try {
    const data = {
      points,
      level,
      syncedAt: new Date().toISOString()
    };

    const response = await apiRequest(
      `/communities/${COMMUNITY_ID}/members/${userId}/sync`,
      'POST',
      data
    );
    
    return response;
  } catch (error) {
    logError('Failed to sync rewards with BLKOUTHUB', { userId, points, level, error });
    throw error;
  }
};

/**
 * Award points and sync with BLKOUTHUB
 * @param userId User ID
 * @param points Points to award
 * @param description Description of the activity
 * @param metadata Additional metadata
 */
export const awardPointsAndSync = async (
  userId: string,
  points: number,
  description: string,
  metadata?: Record<string, any>
): Promise<any> => {
  try {
    const data = {
      points,
      description,
      metadata,
      awardedAt: new Date().toISOString()
    };

    const response = await apiRequest(
      `/communities/${COMMUNITY_ID}/members/${userId}/award-points`,
      'POST',
      data
    );
    
    return response;
  } catch (error) {
    logError('Failed to award points and sync', { userId, points, description, error });
    throw error;
  }
};

/**
 * Validates a webhook signature from Heartbeat
 * @param signature The signature from the request headers
 * @param payload The raw request body
 * @returns Boolean indicating if the signature is valid
 */
export const validateWebhookSignature = (signature: string, payload: string): boolean => {
  if (!WEBHOOK_SECRET) {
    logError('Webhook secret not configured');
    return false;
  }

  try {
    // In a real implementation, this would validate the signature
    // using crypto methods and the WEBHOOK_SECRET
    // For now, we'll just check if the signature exists
    return !!signature;
  } catch (error) {
    logError('Failed to validate webhook signature', { error });
    return false;
  }
};

/**
 * Handle webhook events from Heartbeat
 * @param event The webhook event
 * @param payload The webhook payload
 */
export const handleWebhookEvent = async (event: string, payload: any): Promise<void> => {
  logInfo('Received Heartbeat webhook event', { event, payload });

  switch (event) {
    case 'member.points_updated':
      // Handle points updated event
      await handlePointsUpdated(payload);
      break;
    case 'member.level_updated':
      // Handle level updated event
      await handleLevelUpdated(payload);
      break;
    default:
      logInfo('Unhandled webhook event', { event });
      break;
  }
};

/**
 * Handle points updated webhook event
 * @param payload Webhook payload
 */
const handlePointsUpdated = async (payload: any): Promise<void> => {
  const { member_id, points } = payload;
  
  logInfo('Member points updated', { member_id, points });
  
  // Here you would update your local database with the new points
  // This is a placeholder for actual implementation
};

/**
 * Handle level updated webhook event
 * @param payload Webhook payload
 */
const handleLevelUpdated = async (payload: any): Promise<void> => {
  const { member_id, level } = payload;
  
  logInfo('Member level updated', { member_id, level });
  
  // Here you would update your local database with the new level
  // This is a placeholder for actual implementation
};

// Mock data functions for development
const getMockData = (endpoint: string, method: string, data?: any): any => {
  // Mock rewards data
  if (endpoint.includes('/rewards') && method === 'GET') {
    return {
      points: 150,
      level: 'Silver',
      badges: [
        { id: 'badge-001', name: 'Community Contributor', description: 'Awarded for contributing to the community', icon_url: 'https://example.com/badges/contributor.png' },
        { id: 'badge-002', name: 'Event Organizer', description: 'Awarded for organizing events', icon_url: 'https://example.com/badges/organizer.png' }
      ],
      achievements: [
        { id: 'achievement-001', name: 'First Event', description: 'Attended your first event', completed_at: '2025-01-15T12:00:00Z' },
        { id: 'achievement-002', name: 'Content Creator', description: 'Created your first piece of content', completed_at: '2025-02-20T15:30:00Z' }
      ],
      next_level: {
        name: 'Gold',
        points_needed: 50
      }
    };
  }

  // Mock sync response
  if (endpoint.includes('/sync') && method === 'POST') {
    return {
      success: true,
      synced_at: new Date().toISOString(),
      user_id: data?.user_id || 'mock-user-id',
      points: data?.points || 0,
      level: data?.level || 'Bronze'
    };
  }

  // Mock award points response
  if (endpoint.includes('/award-points') && method === 'POST') {
    return {
      success: true,
      awarded_at: new Date().toISOString(),
      user_id: data?.user_id || 'mock-user-id',
      points: data?.points || 0,
      total_points: 150 + (data?.points || 0),
      description: data?.description || ''
    };
  }

  // Default mock response
  return {
    success: true,
    mock: true,
    endpoint,
    method,
    timestamp: new Date().toISOString()
  };
};

export default {
  isBlkoutHubEnabled,
  getBlkoutHubRewards,
  syncRewardsWithBlkoutHub,
  awardPointsAndSync,
  validateWebhookSignature,
  handleWebhookEvent
};