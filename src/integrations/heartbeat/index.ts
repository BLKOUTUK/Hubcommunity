/**
 * BLKOUTHUB Integration via Heartbeat.chat
 * 
 * This module provides integration with BLKOUTHUB.com through the Heartbeat.chat API.
 * It allows syncing of member rewards, points, and activities between platforms.
 * 
 * Documentation: https://heartbeat.readme.io
 */

// Use mock client in development mode if no API key is provided
import { heartbeatClient, HeartbeatUser, HeartbeatBadge, HeartbeatActivity, HeartbeatRewardSummary } from './client';
import { heartbeatMockClient } from './mockClient';
import { getBlkoutHubRewards, syncRewardsWithBlkoutHub, awardPointsAndSync, BlkoutHubRewards } from './rewardsService';
import { processWebhookEvent, registerWebhooks, verifyWebhookSignature, ACTIVITY_POINTS } from './webhooks';

// Determine which client to use based on environment
const useRealClient = import.meta.env.VITE_HEARTBEAT_API_KEY && 
                     import.meta.env.VITE_HEARTBEAT_API_KEY !== 'your_heartbeat_api_key';

// Export the appropriate client
export const client = useRealClient ? heartbeatClient : heartbeatMockClient;

// Export types and services
export type { 
  HeartbeatUser, 
  HeartbeatBadge, 
  HeartbeatActivity, 
  HeartbeatRewardSummary,
  BlkoutHubRewards
};

export {
  getBlkoutHubRewards,
  syncRewardsWithBlkoutHub,
  awardPointsAndSync,
  // Webhook related exports
  processWebhookEvent,
  registerWebhooks,
  verifyWebhookSignature,
  ACTIVITY_POINTS
};

// Export a function to check if BLKOUTHUB integration is enabled
export function isBlkoutHubEnabled(): boolean {
  return useRealClient || import.meta.env.DEV;
}