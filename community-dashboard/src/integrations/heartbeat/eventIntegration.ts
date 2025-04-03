/**
 * BLKOUTHUB Event Integration
 * 
 * This module provides integration between the event management system
 * and BLKOUTHUB through the Heartbeat API.
 */

import airtableClient from '../airtable/client';
import { awardPointsAndSync, isBlkoutHubEnabled } from './index';
import { logError, logInfo } from '../../services/errorLogging';

// Event interface used for integration
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    type: 'in-person' | 'online' | 'hybrid';
    isOnline: boolean;
  };
  organizer: string;
  attendees?: number;
  capacity?: number;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  category: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
  websiteUrl?: string;
  ticketUrl?: string;
  priceInfo?: string;
  source: 'eventbrite' | 'outsavvy' | 'airtable' | 'manual';
  externalId?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

/**
 * Get all approved events from all sources
 * @returns Array of approved events
 */
export const getAllApprovedEvents = async (): Promise<Event[]> => {
  try {
    // Get events from Airtable
    const airtableEvents = await airtableClient.getRecords('Events', {
      filterByFormula: "{Approval_Status}='approved'",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });

    // Get approved events from other sources if needed
    // This could be extended in the future to include other sources

    // Combine all events
    const allEvents = [...mapAirtableEvents(airtableEvents, 'approved')];

    return allEvents;
  } catch (error) {
    logError('Failed to get all approved events', { error });
    return [];
  }
};

/**
 * Get all pending events from all sources
 * @returns Array of pending events
 */
export const getAllPendingEvents = async (): Promise<Event[]> => {
  try {
    // Get events from Airtable
    const airtableEvents = await airtableClient.getRecords('Events', {
      filterByFormula: "{Approval_Status}='pending'",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });

    // Get pending events from other sources if needed
    // This could be extended in the future to include other sources

    // Combine all events
    const allEvents = [...mapAirtableEvents(airtableEvents, 'pending')];

    return allEvents;
  } catch (error) {
    logError('Failed to get all pending events', { error });
    return [];
  }
};

/**
 * Approve an event and sync with BLKOUTHUB
 * @param eventId Event ID
 */
export const approveEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Update event status in Airtable
    const updatedEvent = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'approved',
      Updated_At: new Date().toISOString()
    });

    if (!updatedEvent) {
      throw new Error(`Failed to update event with ID ${eventId}`);
    }

    // Sync with BLKOUTHUB if integration is enabled
    if (isBlkoutHubEnabled() && updatedEvent.Organizer_UserId) {
      try {
        // Award points to the event organizer
        await awardPointsAndSync(
          updatedEvent.Organizer_UserId,
          50,
          `Event approved: ${updatedEvent.Title}`,
          {
            eventId: updatedEvent.id,
            eventTitle: updatedEvent.Title,
            approvedAt: new Date().toISOString()
          }
        );
        
        logInfo('Points awarded to event organizer', {
          userId: updatedEvent.Organizer_UserId,
          eventId: updatedEvent.id
        });
      } catch (error) {
        // Don't fail the approval if BLKOUTHUB sync fails
        logError('Failed to award points for event approval', {
          eventId,
          organizerId: updatedEvent.Organizer_UserId,
          error
        });
      }
    }

    return true;
  } catch (error) {
    logError('Failed to approve event', { eventId, error });
    return false;
  }
};

/**
 * Reject an event
 * @param eventId Event ID
 * @param reason Rejection reason
 */
export const rejectEvent = async (eventId: string, reason?: string): Promise<boolean> => {
  try {
    // Update event status in Airtable
    const updatedEvent = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'rejected',
      Rejection_Reason: reason || 'No reason provided',
      Updated_At: new Date().toISOString()
    });

    if (!updatedEvent) {
      throw new Error(`Failed to update event with ID ${eventId}`);
    }

    return true;
  } catch (error) {
    logError('Failed to reject event', { eventId, reason, error });
    return false;
  }
};

/**
 * Record event attendance for a user and award points
 * @param eventId Event ID
 * @param userId User ID
 */
export const recordEventAttendance = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    // Get the event
    const event = await airtableClient.getRecord('Events', eventId);

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Record attendance in Airtable (you would need an Attendees table)
    await airtableClient.createRecord('Attendees', {
      Event_ID: eventId,
      User_ID: userId,
      Attended_At: new Date().toISOString()
    });

    // Sync with BLKOUTHUB if integration is enabled
    if (isBlkoutHubEnabled()) {
      try {
        // Award points for attending the event
        await awardPointsAndSync(
          userId,
          25,
          `Attended event: ${event.Title}`,
          {
            eventId: event.id,
            eventTitle: event.Title,
            attendedAt: new Date().toISOString()
          }
        );
        
        logInfo('Points awarded for event attendance', {
          userId,
          eventId
        });
      } catch (error) {
        // Don't fail the attendance recording if BLKOUTHUB sync fails
        logError('Failed to award points for event attendance', {
          eventId,
          userId,
          error
        });
      }
    }

    return true;
  } catch (error) {
    logError('Failed to record event attendance', { eventId, userId, error });
    return false;
  }
};

/**
 * Map Airtable event records to the Event interface
 * @param records Airtable records
 * @param approvalStatus Filter by approval status
 * @returns Array of Event objects
 */
const mapAirtableEvents = (records: any[], approvalStatus?: 'pending' | 'approved' | 'rejected'): Event[] => {
  return records
    .filter(record => !approvalStatus || record.Approval_Status === approvalStatus)
    .map(record => mapAirtableRecordToEvent(record));
};

/**
 * Map Airtable location type to event location type
 * @param locationType Airtable location type
 * @returns Event location type
 */
export const mapAirtableLocationTypeToEventType = (
  locationType?: string
): 'in-person' | 'online' | 'hybrid' => {
  if (!locationType) return 'in-person';
  
  switch (locationType.toLowerCase()) {
    case 'online':
      return 'online';
    case 'hybrid':
      return 'hybrid';
    case 'in-person':
    default:
      return 'in-person';
  }
};

/**
 * Get event status based on dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Event status
 */
export const getStatusFromDates = (
  startDate?: string,
  endDate?: string
): 'upcoming' | 'ongoing' | 'past' | 'cancelled' => {
  if (!startDate) return 'upcoming';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
  
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
};

/**
 * Map an Airtable record to the Event interface
 * @param record Airtable record
 * @returns Event object
 */
const mapAirtableRecordToEvent = (record: any): Event => {
  if (!record) {
    throw new Error('Cannot map undefined record to Event');
  }

  return {
    id: record.id,
    title: record.Title || '',
    description: record.Description || '',
    startDate: record.Start_Date || '',
    endDate: record.End_Date || '',
    location: {
      name: record.Location_Name || '',
      address: record.Location_Address || '',
      type: mapAirtableLocationTypeToEventType(record.Location_Type),
      isOnline: record.Is_Online || false
    },
    organizer: record.Organizer_Name || '',
    attendees: record.Attendees || 0,
    capacity: record.Capacity || 0,
    status: getStatusFromDates(record.Start_Date, record.End_Date),
    category: record.Category || 'uncategorized',
    approvalStatus: record.Approval_Status || 'pending',
    imageUrl: record.Image_URL,
    websiteUrl: record.Website_URL,
    ticketUrl: record.Ticket_URL,
    priceInfo: record.Price_Info,
    source: (record.Source as Event['source']) || 'airtable',
    externalId: record.External_ID,
    createdAt: record.Created_At || new Date().toISOString(),
    updatedAt: record.Updated_At || new Date().toISOString(),
    isFeatured: record.Is_Featured || false
  };
};

export default {
  getAllApprovedEvents,
  getAllPendingEvents,
  approveEvent,
  rejectEvent,
  recordEventAttendance,
  mapAirtableEvents,
  mapAirtableLocationTypeToEventType,
  getStatusFromDates
};