/**
 * Outsavvy Integration Client
 * 
 * This client provides methods to interact with Outsavvy's API to fetch
 * Black LGBT events and manage them within the community dashboard.
 * 
 * API Reference: https://www.outsavvy.com/developer
 */

import { logError } from '../../services/errorLogging';
import airtableClient from '../airtable/client';

// Event types for Outsavvy
export interface OutsavvyEvent {
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
  source: 'outsavvy';
  createdAt: string;
  updatedAt: string;
  externalId: string;
  // Outsavvy-specific fields
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
  };
  organizer?: {
    id: string;
    name: string;
    logo?: string;
  };
  ticketing?: {
    lowestPrice: number;
    highestPrice: number;
    currency: string;
  };
  tags?: string[];
}

// API configuration
// @ts-ignore - Vite provides import.meta.env
const outsavvyApiKey = import.meta.env.VITE_OUTSAVVY_API_KEY || '';
// @ts-ignore - Vite provides import.meta.env
const outsavvyApiEndpoint = import.meta.env.VITE_OUTSAVVY_API_ENDPOINT || 'https://api.outsavvy.com/v1';

// Check if environment variables are set
if (!outsavvyApiKey) {
  console.warn('Missing Outsavvy API key. Check your .env file.');
}

/**
 * Fetch events from Outsavvy API
 * @param params Optional query parameters
 * @returns Array of Outsavvy events
 */
export const fetchOutsavvyEvents = async (params: Record<string, string> = {}): Promise<OutsavvyEvent[]> => {
  try {
    // Default query parameters for Black LGBT events
    const defaultParams = {
      tags: 'black,lgbt,queer,bipoc,qtipoc',
      limit: '50',
      upcoming: 'true',
      ...params
    };

    // Build query string
    const queryString = Object.entries(defaultParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Fetch data from Outsavvy API
    const response = await fetch(`${outsavvyApiEndpoint}/events?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${outsavvyApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Outsavvy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform API response to OutsavvyEvent format
    return transformOutsavvyEvents(data.events || []);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching events from Outsavvy');
    logError(errorObj, { params });
    throw errorObj;
  }
};

/**
 * Get Outsavvy events that have been imported and approved
 * @returns Array of approved Outsavvy events
 */
export const getOutsavvyEvents = async (): Promise<OutsavvyEvent[]> => {
  try {
    const records = await airtableClient.getRecords('Events', {
      filterByFormula: "AND({Source}='outsavvy', {Approval_Status}='approved')",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });
    
    return records.map(transformAirtableToOutsavvyEvent);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching Outsavvy events from Airtable');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get pending Outsavvy events that need approval
 * @returns Array of pending Outsavvy events
 */
export const getPendingOutsavvyEvents = async (): Promise<OutsavvyEvent[]> => {
  try {
    const records = await airtableClient.getRecords('Events', {
      filterByFormula: "AND({Source}='outsavvy', {Approval_Status}='pending')",
      sort: [{ field: 'Start_Date', direction: 'asc' }]
    });
    
    return records.map(transformAirtableToOutsavvyEvent);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching pending Outsavvy events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Import events from Outsavvy API to Airtable
 * @returns Array of imported events
 */
export const importOutsavvyEvents = async (): Promise<OutsavvyEvent[]> => {
  try {
    // Fetch events from Outsavvy API
    const events = await fetchOutsavvyEvents();
    
    // Get existing events to avoid duplicates
    const existingEvents = await airtableClient.getRecords('Events', {
      filterByFormula: "{Source}='outsavvy'",
      fields: ['External_ID']
    });
    const existingIds = existingEvents.map((record: any) => record.External_ID);
    
    
    // Filter out events that already exist
    const newEvents = events.filter(event => !existingIds.includes(event.externalId));
    
    // Create records in Airtable
    const createdEvents: OutsavvyEvent[] = [];
    
    for (const event of newEvents) {
      const airtableData = {
        Title: event.title,
        Description: event.description,
        Start_Date: event.startDate,
        End_Date: event.endDate,
        Location_Name: event.locationName,
        Location_Address: event.locationAddress,
        Location_Type: event.locationType,
        Is_Online: event.isOnline,
        Organizer_Name: event.organizerName,
        Category: event.category,
        Approval_Status: 'pending', // All imported events start as pending
        Image_URL: event.imageUrl,
        Website_URL: event.websiteUrl,
        Ticket_URL: event.ticketUrl,
        Price_Info: event.priceInfo,
        Source: 'outsavvy',
        External_ID: event.externalId,
        Created_At: new Date().toISOString(),
        Updated_At: new Date().toISOString(),
        Is_BLKOUT_Event: event.isBlkoutEvent
      };
      
      const createdRecord = await airtableClient.createRecord('Events', airtableData);
      createdEvents.push(transformAirtableToOutsavvyEvent(createdRecord));
    }
    
    return createdEvents;
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error importing Outsavvy events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Approve an Outsavvy event
 * @param eventId The ID of the event to approve
 * @returns The approved event
 */
export const approveOutsavvyEvent = async (eventId: string): Promise<OutsavvyEvent> => {
  try {
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'approved',
      Updated_At: new Date().toISOString()
    });
    
    return transformAirtableToOutsavvyEvent(updatedRecord);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error approving Outsavvy event ${eventId}`);
    logError(errorObj, { eventId });
    throw errorObj;
  }
};

/**
 * Reject an Outsavvy event
 * @param eventId The ID of the event to reject
 * @returns The rejected event
 */
export const rejectOutsavvyEvent = async (eventId: string): Promise<OutsavvyEvent> => {
  try {
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'rejected',
      Updated_At: new Date().toISOString()
    });
    
    return transformAirtableToOutsavvyEvent(updatedRecord);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error rejecting Outsavvy event ${eventId}`);
    logError(errorObj, { eventId });
    throw errorObj;
  }
};

/**
 * Transform API response from Outsavvy to OutsavvyEvent format
 * @param events Events from Outsavvy API
 * @returns Transformed OutsavvyEvent objects
 */
const transformOutsavvyEvents = (events: any[]): OutsavvyEvent[] => {
  return events.map(event => {
    // Determine if this might be a BLKOUT event (for manual review)
    const possibleBlkoutEvent = 
      (event.organizer && 
       event.organizer.name && 
       event.organizer.name.toLowerCase().includes('blkout')) || 
      (event.title && 
       event.title.toLowerCase().includes('blkout'));
    
    // Determine location type
    let locationType: 'online' | 'in-person' | 'hybrid' = 'in-person';
    if (event.is_online) {
      locationType = event.has_venue ? 'hybrid' : 'online';
    }
    
    return {
      id: event.id || '',
      title: event.title || '',
      description: event.description || '',
      startDate: event.start_time || '',
      endDate: event.end_time || '',
      locationName: event.venue?.name || 'Online',
      locationAddress: event.venue ? `${event.venue.address || ''}, ${event.venue.city || ''}, ${event.venue.postcode || ''}` : '',
      locationType,
      isOnline: event.is_online || false,
      category: event.category || 'uncategorized',
      isBlkoutEvent: possibleBlkoutEvent,
      approvalStatus: 'pending',
      organizerName: event.organizer?.name || '',
      imageUrl: event.image_url || '',
      websiteUrl: event.url || '',
      ticketUrl: event.ticket_url || event.url || '',
      priceInfo: event.ticketing?.lowestPrice ? `${event.ticketing.currency} ${event.ticketing.lowestPrice}` : 'Free',
      source: 'outsavvy',
      externalId: `outsavvy-${event.id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      venue: event.venue,
      organizer: event.organizer,
      ticketing: event.ticketing,
      tags: event.tags || []
    };
  });
};

/**
 * Transform Airtable record to OutsavvyEvent
 * @param record Airtable record
 * @returns OutsavvyEvent object
 */
const transformAirtableToOutsavvyEvent = (record: any): OutsavvyEvent => {
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
    source: 'outsavvy',
    externalId: record.External_ID || '',
    createdAt: record.Created_At || new Date().toISOString(),
    updatedAt: record.Updated_At || new Date().toISOString()
  };
};

export default {
  fetchOutsavvyEvents,
  getOutsavvyEvents,
  getPendingOutsavvyEvents,
  importOutsavvyEvents,
  approveOutsavvyEvent,
  rejectOutsavvyEvent
};