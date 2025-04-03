/**
 * Eventbrite Integration Client
 * 
 * This client provides methods to interact with Eventbrite and manage
 * scraped events in the community dashboard.
 */

import { logError } from '../../services/errorLogging';
import airtableClient from '../airtable/client';

// Event types
export interface EventbriteEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  locationName: string;
  locationAddress: string;
  locationType: 'online' | 'in-person' | 'hybrid';
  isOnline: boolean;
  category: string;
  isBlkoutEvent: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  organizerName: string;
  imageUrl: string;
  websiteUrl: string;
  ticketUrl: string;
  priceInfo: string;
  source: 'eventbrite' | 'manual';
  createdAt: string;
  updatedAt: string;
  externalId: string;
}

/**
 * Fetch events from Airtable that originated from Eventbrite
 * @returns Array of Eventbrite events
 */
export const getEventbriteEvents = async (): Promise<EventbriteEvent[]> => {
  try {
    // Filter for events with source=eventbrite
    const records = await airtableClient.getRecords('Events', {
      filterByFormula: "{Source}='eventbrite'",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });
    
    return records.map(transformAirtableToEventbriteEvent);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching Eventbrite events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Fetch all events (both manual and Eventbrite) from Airtable
 * @returns Array of Eventbrite events
 */
export const getAllEvents = async (): Promise<EventbriteEvent[]> => {
  try {
    const records = await airtableClient.getRecords('Events', {
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });
    
    return records.map(transformAirtableToEventbriteEvent);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching all events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Fetch pending events that need approval
 * @returns Array of Eventbrite events pending approval
 */
export const getPendingEvents = async (): Promise<EventbriteEvent[]> => {
  try {
    const records = await airtableClient.getRecords('Events', {
      filterByFormula: "{Approval_Status}='pending'",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });
    
    return records.map(transformAirtableToEventbriteEvent);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching pending events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Approve an event
 * @param eventId The ID of the event to approve
 * @returns The updated event
 */
export const approveEvent = async (eventId: string): Promise<EventbriteEvent> => {
  try {
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'approved',
      Updated_At: new Date().toISOString()
    });
    
    return transformAirtableToEventbriteEvent(updatedRecord);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error approving event ${eventId}`);
    logError(errorObj, { eventId });
    throw errorObj;
  }
};

/**
 * Reject an event
 * @param eventId The ID of the event to reject
 * @returns The updated event
 */
export const rejectEvent = async (eventId: string): Promise<EventbriteEvent> => {
  try {
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'rejected',
      Updated_At: new Date().toISOString()
    });
    
    return transformAirtableToEventbriteEvent(updatedRecord);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error rejecting event ${eventId}`);
    logError(errorObj, { eventId });
    throw errorObj;
  }
};

/**
 * Transform Airtable record to EventbriteEvent
 * @param record Airtable record
 * @returns EventbriteEvent object
 */
const transformAirtableToEventbriteEvent = (record: any): EventbriteEvent => {
  return {
    id: record.id,
    title: record.Title || '',
    description: record.Description || '',
    startDate: record.Start_Date || '',
    endDate: record.End_Date || '',
    locationName: record.Location_Name || '',
    locationAddress: record.Location_Address || '',
    locationType: record.Location_Type || 'in-person',
    isOnline: record.Is_Online || false,
    category: record.Category || 'uncategorized',
    isBlkoutEvent: record.Is_BLKOUT_Event || false,
    approvalStatus: record.Approval_Status || 'pending',
    organizerName: record.Organizer_Name || '',
    imageUrl: record.Image_URL || '',
    websiteUrl: record.Website_URL || '',
    ticketUrl: record.Ticket_URL || '',
    priceInfo: record.Price_Info || 'Free',
    source: record.Source || 'manual',
    createdAt: record.Created_At || new Date().toISOString(),
    updatedAt: record.Updated_At || new Date().toISOString(),
    externalId: record.External_ID || ''
  };
};

// Export functions
export default {
  getEventbriteEvents,
  getAllEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
};