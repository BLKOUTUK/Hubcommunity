import { logError, logMessage } from './errorLogging';
import engagementTrackingService from './engagementTracking';
import rewardsService from './rewards';
import airtableClient from '../integrations/airtable/client';

/**
 * Types for Heartbeat webhooks
 * Based on the Heartbeat API documentation
 */

// Webhook action types
export type WebhookActionName = 
  | 'USER_JOIN'
  | 'USER_UPDATE'
  | 'EVENT_CREATE'
  | 'EVENT_RSVP'
  | 'THREAD_CREATE'
  | 'MENTION'
  | 'DIRECT_MESSAGE'
  | 'COURSE_COMPLETED'
  | 'GROUP_JOIN'
  | 'ABANDONED_CART';

// Webhook registration request
export interface WebhookRegistration {
  action: {
    name: WebhookActionName;
    filter?: Record<string, any>;
  };
  url: string;
}

// Webhook response
export interface WebhookResponse {
  id: string;
  success: boolean;
  message?: string;
}

// Webhook payloads for different event types
export interface UserJoinPayload {
  id: string;
  name: string;
  email: string;
}

export interface UserUpdatePayload {
  id: string;
}

export interface EventCreatePayload {
  id: string;
}

export interface EventRsvpPayload {
  eventID: string;
  email: string;
  userID: string | null; // Will be null for external guests
}

export interface ThreadCreatePayload {
  id: string;
  channelID: string;
}

export interface MentionPayload {
  mentionedUsers: { id: string; type: 'USER' | 'GROUP' }[];
  userID: string; // The user that sent the mention
  source:
    | { type: 'THREAD'; channelID: string; threadID: string }
    | {
        type: 'COMMENT';
        channelID: string;
        threadID: string;
        commentID: string;
      };
}

export interface DirectMessagePayload {
  senderUserID: string;
  receiverUserID: string;
  chatID: string;
  chatMessageID: string;
}

export interface CourseCompletedPayload {
  courseID: string;
  courseName: string;
  userID: string;
}

export interface GroupJoinPayload {
  userID: string;
  groupID: string;
}

export interface AbandonedCartPayload {
  email: string;
  invitationLinkID: string;
  groupIDs: string[];
}

// Union type for all webhook payloads
export type WebhookPayload =
  | UserJoinPayload
  | UserUpdatePayload
  | EventCreatePayload
  | EventRsvpPayload
  | ThreadCreatePayload
  | MentionPayload
  | DirectMessagePayload
  | CourseCompletedPayload
  | GroupJoinPayload
  | AbandonedCartPayload;

// Webhook event record
export interface WebhookEvent {
  id?: string;
  action: WebhookActionName;
  payload: WebhookPayload;
  processed: boolean;
  timestamp: string;
}

/**
 * Heartbeat API client configuration
 * This should be updated with actual API details when available
 */
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const HEARTBEAT_API_URL = 'https://api.heartbeatchat.com';
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const HEARTBEAT_API_KEY = import.meta.env.VITE_HEARTBEAT_API_KEY || '';
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const WEBHOOK_SECRET = import.meta.env.VITE_HEARTBEAT_WEBHOOK_SECRET || '';

/**
 * Register a webhook with Heartbeat
 * @param webhook The webhook registration details
 * @returns The webhook response
 */
export const registerWebhook = async (webhook: WebhookRegistration): Promise<WebhookResponse> => {
  try {
    logMessage(`Registering webhook: ${JSON.stringify(webhook)}`, 'info');
    
    // This is a placeholder implementation
    // In a real implementation, you would use fetch or axios to register the webhook with Heartbeat
    
    // Placeholder for actual API call
    // const response = await fetch(`${HEARTBEAT_API_URL}/webhooks`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${HEARTBEAT_API_KEY}`,
    //   },
    //   body: JSON.stringify(webhook),
    // });
    
    // if (!response.ok) {
    //   throw new Error(`Heartbeat API error: ${response.status} ${response.statusText}`);
    // }
    
    // const data = await response.json();
    // return data;
    
    // Return a mock response for now
    return {
      id: `webhook_${Date.now()}`,
      success: true,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error registering webhook');
    logError(errorObj, { webhook });
    throw errorObj;
  }
};

/**
 * Process a webhook event from Heartbeat
 * @param action The webhook action name
 * @param payload The webhook payload
 * @returns The processed webhook event
 */
export const processWebhookEvent = async (
  action: WebhookActionName,
  payload: WebhookPayload
): Promise<WebhookEvent> => {
  try {
    // Create a webhook event record
    const event: WebhookEvent = {
      action,
      payload,
      processed: false,
      timestamp: new Date().toISOString(),
    };
    
    // Store the event in Airtable
    const record = await airtableClient.createRecord('Webhook Events', {
      Action: event.action,
      Payload: JSON.stringify(event.payload),
      Processed: false,
      Timestamp: event.timestamp,
    });
    
    // Process the event based on the action type
    switch (action) {
      case 'USER_JOIN':
        await processUserJoin(payload as UserJoinPayload);
        break;
      case 'EVENT_RSVP':
        await processEventRsvp(payload as EventRsvpPayload);
        break;
      case 'COURSE_COMPLETED':
        await processCourseCompleted(payload as CourseCompletedPayload);
        break;
      case 'GROUP_JOIN':
        await processGroupJoin(payload as GroupJoinPayload);
        break;
      // Add more cases as needed
      default:
        logMessage(`Unhandled webhook action: ${action}`, 'warning');
    }
    
    // Update the event record to mark as processed
    await airtableClient.updateRecord('Webhook Events', record.id, {
      Processed: true,
    });
    
    return {
      id: record.id,
      ...event,
      processed: true,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error processing webhook event');
    logError(errorObj, { action, payload });
    throw errorObj;
  }
};

/**
 * Process a USER_JOIN webhook event
 * @param payload The USER_JOIN payload
 */
const processUserJoin = async (payload: UserJoinPayload): Promise<void> => {
  try {
    // Initialize the user in the rewards system
    await rewardsService.initializeUserRewards(payload.id, payload.name);
    
    // Track the user join as an engagement event
    await engagementTrackingService.trackEngagement({
      userId: payload.id,
      action: 'user_join',
      timestamp: new Date().toISOString(),
      metadata: {
        email: payload.email,
      },
    });
    
    logMessage(`Processed USER_JOIN for user ${payload.id} (${payload.name})`, 'info');
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error processing USER_JOIN event');
    logError(errorObj, { payload });
    throw errorObj;
  }
};

/**
 * Process an EVENT_RSVP webhook event
 * @param payload The EVENT_RSVP payload
 */
const processEventRsvp = async (payload: EventRsvpPayload): Promise<void> => {
  try {
    // Only process RSVPs from registered users
    if (payload.userID) {
      // Track the event RSVP as an engagement event
      await engagementTrackingService.trackEngagement({
        userId: payload.userID,
        action: 'event_rsvp',
        timestamp: new Date().toISOString(),
        metadata: {
          eventId: payload.eventID,
          email: payload.email,
        },
      });
      
      logMessage(`Processed EVENT_RSVP for user ${payload.userID} to event ${payload.eventID}`, 'info');
    } else {
      logMessage(`Skipped EVENT_RSVP for guest (${payload.email}) to event ${payload.eventID}`, 'info');
    }
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error processing EVENT_RSVP event');
    logError(errorObj, { payload });
    throw errorObj;
  }
};

/**
 * Process a COURSE_COMPLETED webhook event
 * @param payload The COURSE_COMPLETED payload
 */
const processCourseCompleted = async (payload: CourseCompletedPayload): Promise<void> => {
  try {
    // Track the course completion as an engagement event
    await engagementTrackingService.trackEngagement({
      userId: payload.userID,
      action: 'course_complete',
      timestamp: new Date().toISOString(),
      metadata: {
        courseId: payload.courseID,
        courseName: payload.courseName,
      },
    });
    
    logMessage(`Processed COURSE_COMPLETED for user ${payload.userID} (${payload.courseName})`, 'info');
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error processing COURSE_COMPLETED event');
    logError(errorObj, { payload });
    throw errorObj;
  }
};

/**
 * Process a GROUP_JOIN webhook event
 * @param payload The GROUP_JOIN payload
 */
const processGroupJoin = async (payload: GroupJoinPayload): Promise<void> => {
  try {
    // Track the group join as an engagement event
    await engagementTrackingService.trackEngagement({
      userId: payload.userID,
      action: 'group_join',
      timestamp: new Date().toISOString(),
      metadata: {
        groupId: payload.groupID,
      },
    });
    
    logMessage(`Processed GROUP_JOIN for user ${payload.userID} to group ${payload.groupID}`, 'info');
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error processing GROUP_JOIN event');
    logError(errorObj, { payload });
    throw errorObj;
  }
};

/**
 * Verify webhook signature
 * This ensures that the webhook is coming from Heartbeat
 * @param signature The signature from the request headers
 * @param body The request body
 * @returns Whether the signature is valid
 */
export const verifyWebhookSignature = (signature: string, body: string): boolean => {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would verify the signature using the webhook secret
    
    // For example, using crypto:
    // const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    // const calculatedSignature = hmac.update(body).digest('hex');
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(calculatedSignature)
    // );
    
    // For now, just return true
    return true;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Error verifying webhook signature'));
    return false;
  }
};

/**
 * Register all required webhooks with Heartbeat
 * This can be called during application initialization
 */
export const registerRequiredWebhooks = async (): Promise<void> => {
  try {
    // @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
    const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
    const webhookEndpoint = `${baseUrl}/api/webhooks/heartbeat`;
    
    // Register webhooks for all the events we want to track
    const webhooks: WebhookRegistration[] = [
      {
        action: { name: 'USER_JOIN' },
        url: webhookEndpoint,
      },
      {
        action: { name: 'EVENT_RSVP' },
        url: webhookEndpoint,
      },
      {
        action: { name: 'COURSE_COMPLETED' },
        url: webhookEndpoint,
      },
      {
        action: { name: 'GROUP_JOIN' },
        url: webhookEndpoint,
      },
    ];
    
    // Register each webhook
    for (const webhook of webhooks) {
      await registerWebhook(webhook);
    }
    
    logMessage('Registered all required webhooks with Heartbeat', 'info');
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error registering required webhooks');
    logError(errorObj);
    throw errorObj;
  }
};

// Export the service functions
const webhookHandlerService = {
  registerWebhook,
  processWebhookEvent,
  verifyWebhookSignature,
  registerRequiredWebhooks,
};

export default webhookHandlerService;