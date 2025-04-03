import { logError, logMessage } from './errorLogging';
import airtableClient from '../integrations/airtable/client';
import rewardsService from './rewards';

/**
 * Types for engagement tracking
 */

export interface EngagementEvent {
  id?: string;
  userId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
  synced?: boolean;
}

export interface EngagementMetrics {
  userId: string;
  totalEvents: number;
  lastActive: string;
  actionCounts: Record<string, number>;
  weeklyActivity: Record<string, number>;
}

/**
 * Heartbeat API client configuration
 * This should be updated with actual API details when available
 */
const HEARTBEAT_API_URL = 'https://api.heartbeatchat.com/v1';
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const HEARTBEAT_API_KEY = import.meta.env.VITE_HEARTBEAT_API_KEY || '';

/**
 * Track a user engagement event
 * This function records the event in Airtable and sends it to Heartbeat API
 */
export const trackEngagement = async (event: EngagementEvent): Promise<EngagementEvent> => {
  try {
    // Ensure timestamp is set
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Store in Airtable
    const record = await airtableClient.createRecord('Engagement Events', {
      UserId: eventWithTimestamp.userId,
      Action: eventWithTimestamp.action,
      Timestamp: eventWithTimestamp.timestamp,
      Metadata: JSON.stringify(eventWithTimestamp.metadata || {}),
      Synced: false,
    });

    // Try to sync with Heartbeat API
    let synced = false;
    try {
      await syncEventWithHeartbeat(eventWithTimestamp);
      synced = true;
      
      // Update the record to mark as synced
      await airtableClient.updateRecord('Engagement Events', record.id, {
        Synced: true,
      });
    } catch (syncError) {
      logError(syncError instanceof Error ? syncError : new Error('Error syncing with Heartbeat API'), {
        event: eventWithTimestamp,
      });
      // We'll continue even if sync fails - it can be retried later
    }

    // If this is a reward-eligible action, award points
    if (isRewardEligibleAction(eventWithTimestamp.action)) {
      try {
        await rewardsService.awardPoints(
          eventWithTimestamp.userId,
          mapActionToRewardId(eventWithTimestamp.action),
          `Engagement: ${eventWithTimestamp.action}`
        );
      } catch (rewardError) {
        logError(rewardError instanceof Error ? rewardError : new Error('Error awarding points'), {
          event: eventWithTimestamp,
        });
        // Continue even if rewarding fails
      }
    }

    return {
      id: record.id,
      ...eventWithTimestamp,
      synced,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error tracking engagement');
    logError(errorObj, { event });
    throw errorObj;
  }
};

/**
 * Sync an engagement event with the Heartbeat API
 * This is a placeholder implementation that should be updated with actual API details
 */
const syncEventWithHeartbeat = async (event: EngagementEvent): Promise<void> => {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would use fetch or axios to send the event to the Heartbeat API
    
    logMessage(`Would send event to Heartbeat API: ${JSON.stringify(event)}`, 'info');
    
    // Placeholder for actual API call
    // const response = await fetch(`${HEARTBEAT_API_URL}/engage`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${HEARTBEAT_API_KEY}`,
    //   },
    //   body: JSON.stringify(event),
    // });
    
    // if (!response.ok) {
    //   throw new Error(`Heartbeat API error: ${response.status} ${response.statusText}`);
    // }
    
    // return await response.json();
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error syncing with Heartbeat API');
    throw errorObj;
  }
};

/**
 * Get engagement metrics for a user
 */
export const getUserEngagementMetrics = async (userId: string): Promise<EngagementMetrics> => {
  try {
    // Get all engagement events for the user
    const records = await airtableClient.getRecords('Engagement Events', {
      filterByFormula: `{UserId}='${userId}'`,
      sort: [{ field: 'Timestamp', direction: 'desc' }],
    });

    // Process the events to generate metrics
    const events = records.map((record: any) => ({
      id: record.id,
      userId: record.get('UserId') as string,
      action: record.get('Action') as string,
      timestamp: record.get('Timestamp') as string,
      metadata: JSON.parse(record.get('Metadata') || '{}'),
      synced: record.get('Synced') as boolean,
    }));

    // Calculate metrics
    const actionCounts: Record<string, number> = {};
    const weeklyActivity: Record<string, number> = {};
    
    // Get the last 7 days as strings (YYYY-MM-DD)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    // Initialize weekly activity with zeros
    last7Days.forEach(day => {
      weeklyActivity[day] = 0;
    });

    // Process each event
    events.forEach((event: EngagementEvent) => {
      // Count by action type
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
      
      // Count by day for weekly activity
      const day = event.timestamp.split('T')[0];
      if (weeklyActivity[day] !== undefined) {
        weeklyActivity[day] += 1;
      }
    });

    return {
      userId,
      totalEvents: events.length,
      lastActive: events.length > 0 ? events[0].timestamp : new Date().toISOString(),
      actionCounts,
      weeklyActivity,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error getting engagement metrics for user ${userId}`);
    logError(errorObj, { userId });
    throw errorObj;
  }
};

/**
 * Get community-wide engagement metrics
 */
export const getCommunityEngagementMetrics = async (): Promise<Record<string, any>> => {
  try {
    // Get all engagement events
    const records = await airtableClient.getRecords('Engagement Events', {
      sort: [{ field: 'Timestamp', direction: 'desc' }],
    });

    // Process the events to generate metrics
    const events = records.map((record: any) => ({
      id: record.id,
      userId: record.get('UserId') as string,
      action: record.get('Action') as string,
      timestamp: record.get('Timestamp') as string,
    }));

    // Calculate metrics
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map((e: any) => e.userId)).size;
    
    // Count events by action type
    const actionCounts: Record<string, number> = {};
    events.forEach((event: any) => {
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    });
    
    // Count events by day for the last 30 days
    const dailyActivity: Record<string, number> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    // Initialize daily activity with zeros
    last30Days.forEach(day => {
      dailyActivity[day] = 0;
    });
    
    // Count events by day
    events.forEach((event: any) => {
      const day = event.timestamp.split('T')[0];
      if (dailyActivity[day] !== undefined) {
        dailyActivity[day] += 1;
      }
    });

    return {
      totalEvents,
      uniqueUsers,
      actionCounts,
      dailyActivity,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error getting community engagement metrics');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Sync all unsynchronized events with Heartbeat API
 * This can be run as a scheduled job
 */
export const syncPendingEvents = async (): Promise<{ success: boolean; syncedCount: number }> => {
  try {
    // Get all unsynchronized events
    const records = await airtableClient.getRecords('Engagement Events', {
      filterByFormula: '{Synced}=FALSE()',
    });

    // Process each event
    let syncedCount = 0;
    for (const record of records) {
      try {
        const event: EngagementEvent = {
          id: record.id,
          userId: record.get('UserId') as string,
          action: record.get('Action') as string,
          timestamp: record.get('Timestamp') as string,
          metadata: JSON.parse(record.get('Metadata') || '{}'),
        };

        await syncEventWithHeartbeat(event);
        
        // Update the record to mark as synced
        await airtableClient.updateRecord('Engagement Events', record.id, {
          Synced: true,
        });
        
        syncedCount++;
      } catch (syncError) {
        logError(syncError instanceof Error ? syncError : new Error('Error syncing event with Heartbeat API'), {
          recordId: record.id,
        });
        // Continue with other events even if one fails
      }
    }

    return {
      success: true,
      syncedCount,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error syncing pending events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Helper function to determine if an action is eligible for rewards
 */
const isRewardEligibleAction = (action: string): boolean => {
  // Define which actions are eligible for rewards
  const eligibleActions = [
    'login',
    'profile_update',
    'content_view',
    'content_create',
    'content_comment',
    'event_rsvp',
    'event_attend',
    'survey_complete',
    'referral',
  ];
  
  return eligibleActions.includes(action);
};

/**
 * Helper function to map engagement actions to reward action IDs
 * This is a placeholder implementation that should be updated with actual reward action IDs
 */
const mapActionToRewardId = (action: string): string => {
  // This mapping should be updated with actual reward action IDs from Airtable
  const actionMap: Record<string, string> = {
    'login': 'recLoginReward',
    'profile_update': 'recProfileUpdateReward',
    'content_view': 'recContentViewReward',
    'content_create': 'recContentCreateReward',
    'content_comment': 'recContentCommentReward',
    'event_rsvp': 'recEventRsvpReward',
    'event_attend': 'recEventAttendReward',
    'survey_complete': 'recSurveyCompleteReward',
    'referral': 'recReferralReward',
  };
  
  return actionMap[action] || 'recDefaultReward';
};

// Export the service functions
const engagementTrackingService = {
  trackEngagement,
  getUserEngagementMetrics,
  getCommunityEngagementMetrics,
  syncPendingEvents,
};

export default engagementTrackingService;