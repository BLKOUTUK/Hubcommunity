/**
 * Rewards Webhooks Integration
 * 
 * This module provides webhook endpoints and handlers for the rewards system,
 * allowing external services (like n8n) to trigger reward actions.
 */

import { logError } from '../../services/errorLogging';

// Define secure webhook key for validation (should match the one in n8n workflow)
// @ts-ignore - Vite provides import.meta.env
const webhookSecretKey = import.meta.env.VITE_REWARDS_WEBHOOK_SECRET || 'blkout-rewards-webhook-secret';

// n8n workflow endpoint
// @ts-ignore - Vite provides import.meta.env
const n8nEndpoint = import.meta.env.VITE_N8N_ENDPOINT || 'http://localhost:5678/webhook/';

/**
 * Trigger a reward action via n8n webhook
 * 
 * @param userId The user ID to award points to
 * @param actionId The reward action ID
 * @param notes Optional notes about the reward
 * @param metadata Additional metadata for the action
 * @returns Promise<boolean> Success status
 */
export const triggerRewardAction = async (
  userId: string,
  actionId: string,
  notes?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    // Construct the webhook payload
    const payload = {
      userId,
      actionId,
      notes,
      metadata,
      timestamp: new Date().toISOString(),
      source: 'community-dashboard',
      webhookKey: webhookSecretKey // For validation on the n8n side
    };

    // Send to n8n webhook endpoint
    const response = await fetch(`${n8nEndpoint}rewards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Key': webhookSecretKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger reward action: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Unknown error triggering reward action');
    
    logError(errorObj, { userId, actionId });
    return false;
  }
};

/**
 * Register webhook event listeners for reward system
 * (For incoming webhooks from n8n to the app)
 */
export const registerRewardWebhooks = () => {
  // This would be implemented differently based on your server setup
  // If using Express, it would be routes
  // If using serverless, it would be API route handlers
  // For this client-side application, we're primarily focusing on outgoing webhooks
  
  console.log('Reward webhooks registered');
};

/**
 * Trigger event attendance reward
 */
export const triggerEventAttendanceReward = async (
  userId: string,
  eventId: string,
  eventTitle: string
): Promise<boolean> => {
  return triggerRewardAction(
    userId,
    'action_event_attendance',
    `Attended event: ${eventTitle}`,
    { eventId, eventTitle }
  );
};

/**
 * Trigger content creation reward
 */
export const triggerContentCreationReward = async (
  userId: string,
  contentId: string,
  contentTitle: string,
  contentType: string
): Promise<boolean> => {
  return triggerRewardAction(
    userId,
    'action_content_creation',
    `Created ${contentType}: ${contentTitle}`,
    { contentId, contentTitle, contentType }
  );
};

/**
 * Trigger feedback submission reward
 */
export const triggerFeedbackSubmissionReward = async (
  userId: string,
  feedbackId: string,
  feedbackType: string
): Promise<boolean> => {
  return triggerRewardAction(
    userId,
    'action_feedback_submission',
    `Submitted ${feedbackType} feedback`,
    { feedbackId, feedbackType }
  );
};

/**
 * Trigger referral reward
 */
export const triggerReferralReward = async (
  userId: string,
  referredUserId: string,
  referredUserName: string
): Promise<boolean> => {
  return triggerRewardAction(
    userId,
    'action_referral',
    `Referred new user: ${referredUserName}`,
    { referredUserId, referredUserName }
  );
};

export default {
  triggerRewardAction,
  registerRewardWebhooks,
  triggerEventAttendanceReward,
  triggerContentCreationReward,
  triggerFeedbackSubmissionReward,
  triggerReferralReward
};