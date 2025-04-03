/**
 * Heartbeat Webhooks Integration
 * 
 * This module provides functionality to handle Heartbeat webhooks for the rewards system.
 * It allows the application to receive events from Heartbeat and award points automatically.
 */

import { heartbeatClient } from './client';
import { awardPointsAndSync } from './rewardsService';
import { logError, logInfo } from '@/services/errorLogging';

// Define point values for different activities
export const ACTIVITY_POINTS = {
  USER_JOIN: 50,           // New user joins the community
  EVENT_RSVP: 10,          // User RSVPs to an event
  THREAD_CREATE: 15,       // User creates a new thread
  COMMENT: 5,              // User comments on a thread
  MENTION: 5,              // User mentions someone
  RESOURCE_SHARE: 20,      // User shares a resource
  COURSE_COMPLETED: 30,    // User completes a course
  GROUP_JOIN: 10,          // User joins a group
};

// Define webhook secret for verification
const webhookSecret = import.meta.env.VITE_HEARTBEAT_WEBHOOK_SECRET;

/**
 * Verify webhook signature to ensure it's from Heartbeat
 */
export function verifyWebhookSignature(signature: string, body: string): boolean {
  if (!webhookSecret) {
    console.warn('Webhook secret not configured. Skipping signature verification.');
    return true;
  }

  try {
    // In a real implementation, this would verify the HMAC signature
    // For now, we'll just check if the signature exists
    return !!signature;
  } catch (error) {
    logError('Failed to verify webhook signature', { error });
    return false;
  }
}

/**
 * Process a webhook event from Heartbeat
 */
export async function processWebhookEvent(
  eventType: string,
  payload: any,
  signature: string
): Promise<{ success: boolean; message: string }> {
  // Verify the webhook signature
  if (!verifyWebhookSignature(signature, JSON.stringify(payload))) {
    return { success: false, message: 'Invalid webhook signature' };
  }

  try {
    switch (eventType) {
      case 'USER_JOIN':
        await handleUserJoin(payload);
        break;
      case 'EVENT_RSVP':
        await handleEventRsvp(payload);
        break;
      case 'THREAD_CREATE':
        await handleThreadCreate(payload);
        break;
      case 'MENTION':
        await handleMention(payload);
        break;
      case 'COURSE_COMPLETED':
        await handleCourseCompleted(payload);
        break;
      case 'GROUP_JOIN':
        await handleGroupJoin(payload);
        break;
      default:
        logInfo(`Received unhandled webhook event type: ${eventType}`, { payload });
        return { success: true, message: 'Event type not handled' };
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    logError('Error processing webhook event', { eventType, payload, error });
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Register webhooks with Heartbeat
 */
export async function registerWebhooks(callbackUrl: string): Promise<void> {
  try {
    // Register USER_JOIN webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['USER_JOIN'],
    });

    // Register EVENT_RSVP webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['EVENT_RSVP'],
    });

    // Register THREAD_CREATE webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['THREAD_CREATE'],
    });

    // Register COURSE_COMPLETED webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['COURSE_COMPLETED'],
    });

    // Register GROUP_JOIN webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['GROUP_JOIN'],
    });

    logInfo('Successfully registered Heartbeat webhooks', { callbackUrl });
  } catch (error) {
    logError('Failed to register Heartbeat webhooks', { callbackUrl, error });
    throw error;
  }
}

/**
 * Handle USER_JOIN webhook event
 */
async function handleUserJoin(payload: { id: string; name: string; email: string }): Promise<void> {
  const { id: userId, name } = payload;
  
  // Award points for joining the community
  await awardPointsAndSync(
    userId,
    ACTIVITY_POINTS.USER_JOIN,
    'Joined the BLKOUTHUB community',
    { action: 'USER_JOIN' }
  );
  
  logInfo('Awarded points for new user join', { userId, name, points: ACTIVITY_POINTS.USER_JOIN });
}

/**
 * Handle EVENT_RSVP webhook event
 */
async function handleEventRsvp(payload: { eventID: string; userID: string | null; email: string }): Promise<void> {
  const { eventID, userID, email } = payload;
  
  // Only award points for registered users (not guests)
  if (userID) {
    // Get event details
    const event = await heartbeatClient.getEvent(eventID);
    
    // Award points for RSVPing to an event
    await awardPointsAndSync(
      userID,
      ACTIVITY_POINTS.EVENT_RSVP,
      `RSVP'd to event: ${event.title}`,
      { action: 'EVENT_RSVP', eventID }
    );
    
    logInfo('Awarded points for event RSVP', { userID, eventID, points: ACTIVITY_POINTS.EVENT_RSVP });
  }
}

/**
 * Handle THREAD_CREATE webhook event
 */
async function handleThreadCreate(payload: { id: string; channelID: string }): Promise<void> {
  const { id: threadId, channelID } = payload;
  
  // In a real implementation, we would need to get the user ID from the thread
  // For now, we'll assume we have a way to get the user ID
  const userId = 'user-id'; // This would be retrieved from the thread
  
  // Award points for creating a thread
  await awardPointsAndSync(
    userId,
    ACTIVITY_POINTS.THREAD_CREATE,
    'Created a new discussion thread',
    { action: 'THREAD_CREATE', threadId, channelID }
  );
  
  logInfo('Awarded points for thread creation', { userId, threadId, points: ACTIVITY_POINTS.THREAD_CREATE });
}

/**
 * Handle MENTION webhook event
 */
async function handleMention(payload: {
  mentionedUsers: { id: string; type: 'USER' | 'GROUP' }[];
  userID: string;
  source: { type: 'THREAD' | 'COMMENT'; channelID: string; threadID: string; commentID?: string };
}): Promise<void> {
  const { userID, mentionedUsers, source } = payload;
  
  // Award points for mentioning users
  await awardPointsAndSync(
    userID,
    ACTIVITY_POINTS.MENTION,
    `Mentioned ${mentionedUsers.length} user(s) in a ${source.type.toLowerCase()}`,
    { action: 'MENTION', mentionedUsers, source }
  );
  
  logInfo('Awarded points for mentioning users', { userID, mentionedUsers, points: ACTIVITY_POINTS.MENTION });
}

/**
 * Handle COURSE_COMPLETED webhook event
 */
async function handleCourseCompleted(payload: { courseID: string; courseName: string; userID: string }): Promise<void> {
  const { userID, courseID, courseName } = payload;
  
  // Award points for completing a course
  await awardPointsAndSync(
    userID,
    ACTIVITY_POINTS.COURSE_COMPLETED,
    `Completed course: ${courseName}`,
    { action: 'COURSE_COMPLETED', courseID }
  );
  
  logInfo('Awarded points for course completion', { userID, courseID, courseName, points: ACTIVITY_POINTS.COURSE_COMPLETED });
}

/**
 * Handle GROUP_JOIN webhook event
 */
async function handleGroupJoin(payload: { userID: string; groupID: string }): Promise<void> {
  const { userID, groupID } = payload;
  
  // Award points for joining a group
  await awardPointsAndSync(
    userID,
    ACTIVITY_POINTS.GROUP_JOIN,
    'Joined a community group',
    { action: 'GROUP_JOIN', groupID }
  );
  
  logInfo('Awarded points for group join', { userID, groupID, points: ACTIVITY_POINTS.GROUP_JOIN });
}