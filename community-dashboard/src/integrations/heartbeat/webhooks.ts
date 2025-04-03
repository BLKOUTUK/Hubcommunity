/**
 * Heartbeat Webhooks Handler
 *
 * This module handles incoming webhooks from Heartbeat.chat for BLKOUTHUB integration.
 * It allows the community dashboard to react to events in the BLKOUTHUB platform.
 */

import { heartbeatClient } from './client';
import { awardPointsAndSync } from './rewardsService';
import { logError, logInfo } from '../../services/errorLogging';

// Constants for point values for different activities
export const ACTIVITY_POINTS = {
  USER_JOIN: 25,
  EVENT_RSVP: 10,
  THREAD_CREATE: 15,
  COURSE_COMPLETED: 50,
  GROUP_JOIN: 10
};

// Webhook payload interfaces
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface UserJoinPayload extends WebhookPayload {
  data: {
    userId: string;
    username: string;
    displayName: string;
  };
}

export interface EventRsvpPayload extends WebhookPayload {
  data: {
    userId: string;
    username: string;
    displayName: string;
    eventID: string;
  };
}

export interface ThreadCreatePayload extends WebhookPayload {
  data: {
    userId: string;
    username: string;
    displayName: string;
    threadID: string;
    title: string;
    content: string;
  };
}

export interface CourseCompletedPayload extends WebhookPayload {
  data: {
    userId: string;
    username: string;
    displayName: string;
    courseID: string;
    courseName: string;
  };
}

export interface GroupJoinPayload extends WebhookPayload {
  data: {
    userId: string;
    username: string;
    displayName: string;
    groupID: string;
    groupName: string;
  };
}

/**
 * Handler function for incoming webhooks
 * @param payload The webhook payload
 * @param signature The signature header for verification
 * @returns Whether the webhook was handled successfully
 */
export async function handleHeartbeatWebhook(
  payload: WebhookPayload,
  signature: string
): Promise<boolean> {
  try {
    // Verify webhook signature
    const isValid = heartbeatClient.verifyWebhookSignature(
      signature,
      JSON.stringify(payload)
    );

    if (!isValid) {
      logError('Invalid webhook signature', { event: payload.event });
      return false;
    }

    logInfo('Received webhook', { event: payload.event, timestamp: payload.timestamp });

    // Handle different event types
    switch (payload.event) {
      case 'USER_JOIN':
        return handleUserJoin(payload as UserJoinPayload);
      case 'EVENT_RSVP':
        return handleEventRsvp(payload as EventRsvpPayload);
      case 'THREAD_CREATE':
        return handleThreadCreate(payload as ThreadCreatePayload);
      case 'COURSE_COMPLETED':
        return handleCourseCompleted(payload as CourseCompletedPayload);
      case 'GROUP_JOIN':
        return handleGroupJoin(payload as GroupJoinPayload);
      default:
        logInfo('Unhandled webhook event', { event: payload.event });
        return true; // Successfully ignored
    }
  } catch (error) {
    logError('Error handling webhook', { event: payload.event, error });
    return false;
  }
}

/**
 * Handle USER_JOIN event
 */
async function handleUserJoin(payload: UserJoinPayload): Promise<boolean> {
  try {
    const { userId } = payload.data;

    // Award points for joining the community
    await awardPointsAndSync(
      userId,
      ACTIVITY_POINTS.USER_JOIN,
      'Joined the BLKOUTHUB community',
      { action: 'USER_JOIN' }
    );

    return true;
  } catch (error) {
    logError('Error handling USER_JOIN webhook', { error, payload });
    return false;
  }
}

/**
 * Handle EVENT_RSVP event
 */
async function handleEventRsvp(payload: EventRsvpPayload): Promise<boolean> {
  try {
    const { userId, eventID } = payload.data;

    // Get event details
    const event = await heartbeatClient.getEvent(eventID);

    // Award points for RSVP'ing to an event
    await awardPointsAndSync(
      userId,
      ACTIVITY_POINTS.EVENT_RSVP,
      `RSVP'd to the event: ${event.title}`,
      { action: 'EVENT_RSVP', eventID }
    );

    return true;
  } catch (error) {
    logError('Error handling EVENT_RSVP webhook', { error, payload });
    return false;
  }
}

/**
 * Handle THREAD_CREATE event
 */
async function handleThreadCreate(payload: ThreadCreatePayload): Promise<boolean> {
  try {
    const { userId, title } = payload.data;

    // Award points for creating a thread
    await awardPointsAndSync(
      userId,
      ACTIVITY_POINTS.THREAD_CREATE,
      `Created a discussion: ${title}`,
      { action: 'THREAD_CREATE', threadID: payload.data.threadID }
    );

    return true;
  } catch (error) {
    logError('Error handling THREAD_CREATE webhook', { error, payload });
    return false;
  }
}

/**
 * Handle COURSE_COMPLETED event
 */
async function handleCourseCompleted(payload: CourseCompletedPayload): Promise<boolean> {
  try {
    const { userId, courseName } = payload.data;

    // Award points for completing a course
    await awardPointsAndSync(
      userId,
      ACTIVITY_POINTS.COURSE_COMPLETED,
      `Completed the course: ${courseName}`,
      { action: 'COURSE_COMPLETED', courseID: payload.data.courseID }
    );

    return true;
  } catch (error) {
    logError('Error handling COURSE_COMPLETED webhook', { error, payload });
    return false;
  }
}

/**
 * Handle GROUP_JOIN event
 */
async function handleGroupJoin(payload: GroupJoinPayload): Promise<boolean> {
  try {
    const { userId, groupName } = payload.data;

    // Award points for joining a group
    await awardPointsAndSync(
      userId,
      ACTIVITY_POINTS.GROUP_JOIN,
      `Joined the group: ${groupName}`,
      { action: 'GROUP_JOIN', groupID: payload.data.groupID }
    );

    return true;
  } catch (error) {
    logError('Error handling GROUP_JOIN webhook', { error, payload });
    return false;
  }
}

/**
 * Register webhooks with Heartbeat
 * @param callbackUrl The URL to receive webhook callbacks
 */
export async function registerWebhooks(callbackUrl: string): Promise<void> {
  try {
    logInfo('Registering webhooks with Heartbeat', { callbackUrl });

    // Register USER_JOIN webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['USER_JOIN']
    });

    // Register EVENT_RSVP webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['EVENT_RSVP']
    });

    // Register THREAD_CREATE webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['THREAD_CREATE']
    });

    // Register COURSE_COMPLETED webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['COURSE_COMPLETED']
    });

    // Register GROUP_JOIN webhook
    await heartbeatClient.createWebhook({
      url: callbackUrl,
      events: ['GROUP_JOIN']
    });

    logInfo('Successfully registered webhooks');
  } catch (error) {
    logError('Failed to register webhooks', { error, callbackUrl });
  }
}