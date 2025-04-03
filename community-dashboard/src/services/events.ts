/**
 * Events Service
 * 
 * This service provides methods to interact with event data from multiple sources:
 * - Airtable (via the Airtable integration)
 * - Eventbrite (via the Eventbrite integration)
 * - Local data (for testing/development)
 */

import { logError } from './errorLogging';
import airtableClient from '../integrations/airtable/client';
import eventbriteClient, { EventbriteEvent } from '../integrations/eventbrite/client';
import outsavvyClient, { OutsavvyEvent } from '../integrations/outsavvy/client';

// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    type: 'in-person' | 'virtual' | 'hybrid';
    isOnline: boolean;
  };
  organizer: string;
  attendees: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  category: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
  websiteUrl?: string;
  ticketUrl?: string;
  priceInfo?: string;
  source: 'airtable' | 'eventbrite' | 'outsavvy' | 'notion' | 'google' | 'manual';
  externalId?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

/**
 * Get all approved events from all sources
 * @returns Array of events
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    // Get events from Eventbrite integration
    const eventbriteEvents = await eventbriteClient.getAllEvents();
    const mappedEventbriteEvents = eventbriteEvents.map(convertEventbriteToEvent);
    
    // Get events from Outsavvy integration
    const outsavvyEvents = await outsavvyClient.getOutsavvyEvents();
    const mappedOutsavvyEvents = outsavvyEvents.map(convertOutsavvyToEvent);
    
    // In a full implementation, you would also get events from other sources
    // and combine them
    
    // Combine all event sources
    const allEvents = [
      ...mappedEventbriteEvents,
      ...mappedOutsavvyEvents
    ];

    // Return only approved events
    return allEvents.filter(event => event.approvalStatus === 'approved');
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching all events');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get events by status (upcoming, past, ongoing)
 * @param status The status of events to fetch
 * @returns Array of events
 */
export const getEventsByStatus = async (status: 'upcoming' | 'ongoing' | 'past'): Promise<Event[]> => {
  try {
    const allEvents = await getAllEvents();
    return allEvents.filter(event => event.status === status);
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error fetching ${status} events`);
    logError(errorObj, { status });
    throw errorObj;
  }
};

/**
 * Get events pending approval
 * @returns Array of pending events
 */
export const getPendingEvents = async (): Promise<Event[]> => {
  try {
    // Get pending events from all sources
    const pendingEventbriteEvents = await eventbriteClient.getPendingEvents();
    const pendingOutsavvyEvents = await outsavvyClient.getPendingOutsavvyEvents();
    
    // Map and combine all pending events
    const mappedEventbriteEvents = pendingEventbriteEvents.map(convertEventbriteToEvent);
    const mappedOutsavvyEvents = pendingOutsavvyEvents.map(convertOutsavvyToEvent);
    
    return [...mappedEventbriteEvents, ...mappedOutsavvyEvents];
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
 * @param source The source of the event (eventbrite, airtable, etc.)
 * @returns The updated event
 */
export const approveEvent = async (eventId: string, source: string): Promise<Event> => {
  try {
    // Handle based on source
    if (source === 'eventbrite') {
      const updatedEvent = await eventbriteClient.approveEvent(eventId);
      return convertEventbriteToEvent(updatedEvent);
    } else if (source === 'outsavvy') {
      const updatedEvent = await outsavvyClient.approveOutsavvyEvent(eventId);
      return convertOutsavvyToEvent(updatedEvent);
    }
    
    // Default to updating via Airtable
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'approved',
      Updated_At: new Date().toISOString()
    });
    
    // Convert Airtable record to Event format
    return {
      id: updatedRecord.id,
      title: updatedRecord.Title || '',
      description: updatedRecord.Description || '',
      startDate: updatedRecord.Start_Date || '',
      endDate: updatedRecord.End_Date || '',
      location: {
        name: updatedRecord.Location_Name || '',
        address: updatedRecord.Location_Address || '',
        type: mapAirtableLocationTypeToEventType(updatedRecord.Location_Type),
        isOnline: updatedRecord.Is_Online || false
      },
      organizer: updatedRecord.Organizer_Name || '',
      attendees: updatedRecord.Attendees || 0,
      capacity: updatedRecord.Capacity || 0,
      status: getStatusFromDates(updatedRecord.Start_Date, updatedRecord.End_Date),
      category: updatedRecord.Category || 'uncategorized',
      approvalStatus: 'approved',
      imageUrl: updatedRecord.Image_URL,
      websiteUrl: updatedRecord.Website_URL,
      ticketUrl: updatedRecord.Ticket_URL,
      priceInfo: updatedRecord.Price_Info,
      source: (updatedRecord.Source as Event['source']) || 'airtable',
      externalId: updatedRecord.External_ID,
      createdAt: updatedRecord.Created_At || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFeatured: updatedRecord.Is_Featured || false
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error approving event ${eventId}`);
    logError(errorObj, { eventId, source });
    throw errorObj;
  }
};

/**
 * Reject an event
 * @param eventId The ID of the event to reject
 * @param source The source of the event (eventbrite, airtable, etc.)
 * @returns The updated event
 */
export const rejectEvent = async (eventId: string, source: string): Promise<Event> => {
  try {
    // Handle based on source
    if (source === 'eventbrite') {
      const updatedEvent = await eventbriteClient.rejectEvent(eventId);
      return convertEventbriteToEvent(updatedEvent);
    } else if (source === 'outsavvy') {
      const updatedEvent = await outsavvyClient.rejectOutsavvyEvent(eventId);
      return convertOutsavvyToEvent(updatedEvent);
    }
    
    // Default to updating via Airtable
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, {
      Approval_Status: 'rejected',
      Updated_At: new Date().toISOString()
    });
    
    // Return converted event
    return {
      id: updatedRecord.id,
      title: updatedRecord.Title || '',
      description: updatedRecord.Description || '',
      startDate: updatedRecord.Start_Date || '',
      endDate: updatedRecord.End_Date || '',
      location: {
        name: updatedRecord.Location_Name || '',
        address: updatedRecord.Location_Address || '',
        type: mapAirtableLocationTypeToEventType(updatedRecord.Location_Type),
        isOnline: updatedRecord.Is_Online || false
      },
      organizer: updatedRecord.Organizer_Name || '',
      attendees: updatedRecord.Attendees || 0,
      capacity: updatedRecord.Capacity || 0,
      status: getStatusFromDates(updatedRecord.Start_Date, updatedRecord.End_Date),
      category: updatedRecord.Category || 'uncategorized',
      approvalStatus: 'rejected',
      imageUrl: updatedRecord.Image_URL,
      websiteUrl: updatedRecord.Website_URL,
      ticketUrl: updatedRecord.Ticket_URL,
      priceInfo: updatedRecord.Price_Info,
      source: (updatedRecord.Source as Event['source']) || 'airtable',
      externalId: updatedRecord.External_ID,
      createdAt: updatedRecord.Created_At || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFeatured: updatedRecord.Is_Featured || false
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error rejecting event ${eventId}`);
    logError(errorObj, { eventId, source });
    throw errorObj;
  }
};

/**
 * Create a new event
 * @param eventData The event data to create
 * @returns The created event
 */
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  try {
    // Create record in Airtable
    const airtableData = {
      Title: eventData.title,
      Description: eventData.description,
      Start_Date: eventData.startDate,
      End_Date: eventData.endDate,
      Location_Name: eventData.location.name,
      Location_Address: eventData.location.address,
      Location_Type: mapEventLocationTypeToAirtable(eventData.location.type),
      Is_Online: eventData.location.isOnline,
      Organizer_Name: eventData.organizer,
      Attendees: eventData.attendees,
      Capacity: eventData.capacity,
      Category: eventData.category,
      Approval_Status: eventData.approvalStatus,
      Image_URL: eventData.imageUrl,
      Website_URL: eventData.websiteUrl,
      Ticket_URL: eventData.ticketUrl,
      Price_Info: eventData.priceInfo,
      Source: eventData.source,
      External_ID: eventData.externalId,
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString(),
      Is_Featured: eventData.isFeatured
    };
    
    const createdRecord = await airtableClient.createRecord('Events', airtableData);
    
    // Return converted event
    return {
      id: createdRecord.id,
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error creating event');
    logError(errorObj, { eventData });
    throw errorObj;
  }
};

/**
 * Update an event
 * @param eventId The ID of the event to update
 * @param eventData The updated event data
 * @returns The updated event
 */
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  try {
    // Format data for Airtable
    const airtableData: Record<string, any> = {};
    if (eventData.title) airtableData.Title = eventData.title;
    if (eventData.description) airtableData.Description = eventData.description;
    if (eventData.startDate) airtableData.Start_Date = eventData.startDate;
    if (eventData.endDate) airtableData.End_Date = eventData.endDate;
    if (eventData.location) {
      if (eventData.location.name) airtableData.Location_Name = eventData.location.name;
      if (eventData.location.address) airtableData.Location_Address = eventData.location.address;
      if (eventData.location.type) airtableData.Location_Type = mapEventLocationTypeToAirtable(eventData.location.type);
      if (typeof eventData.location.isOnline === 'boolean') airtableData.Is_Online = eventData.location.isOnline;
    }
    if (eventData.organizer) airtableData.Organizer_Name = eventData.organizer;
    if (typeof eventData.attendees === 'number') airtableData.Attendees = eventData.attendees;
    if (typeof eventData.capacity === 'number') airtableData.Capacity = eventData.capacity;
    if (eventData.category) airtableData.Category = eventData.category;
    if (eventData.approvalStatus) airtableData.Approval_Status = eventData.approvalStatus;
    if (eventData.imageUrl) airtableData.Image_URL = eventData.imageUrl;
    if (eventData.websiteUrl) airtableData.Website_URL = eventData.websiteUrl;
    if (eventData.ticketUrl) airtableData.Ticket_URL = eventData.ticketUrl;
    if (eventData.priceInfo) airtableData.Price_Info = eventData.priceInfo;
    if (eventData.source) airtableData.Source = eventData.source;
    if (typeof eventData.isFeatured === 'boolean') airtableData.Is_Featured = eventData.isFeatured;
    
    // Always update the Updated_At field
    airtableData.Updated_At = new Date().toISOString();
    
    // Update record in Airtable
    const updatedRecord = await airtableClient.updateRecord('Events', eventId, airtableData);
    
    // Get the full updated event
    const event = await getEventById(eventId);
    return event;
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error updating event ${eventId}`);
    logError(errorObj, { eventId, eventData });
    throw errorObj;
  }
};

/**
 * Get an event by ID
 * @param eventId The ID of the event to get
 * @returns The event
 */
export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const record = await airtableClient.getRecord('Events', eventId);
    
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
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error fetching event ${eventId}`);
    logError(errorObj, { eventId });
    throw errorObj;
  }
};

/**
 * Convert Eventbrite event to the unified Event format
 * @param event The Eventbrite event
 * @returns The converted Event
 */
const convertEventbriteToEvent = (event: EventbriteEvent): Event => {
  // Determine status based on start and end dates
  const status = getStatusFromDates(event.startDate, event.endDate);
  
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      name: event.locationName,
      address: event.locationAddress,
      type: mapEventbriteLocationTypeToEventType(event.locationType),
      isOnline: event.isOnline
    },
    organizer: event.organizerName,
    attendees: 0, // This data might not be available from Eventbrite
    capacity: 0, // This data might not be available from Eventbrite
    status,
    category: event.category,
    approvalStatus: event.approvalStatus,
    imageUrl: event.imageUrl,
    websiteUrl: event.websiteUrl,
    ticketUrl: event.ticketUrl,
    priceInfo: event.priceInfo,
    source: 'eventbrite',
    externalId: event.externalId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};

/**
 * Determine event status based on dates
 * @param startDate The start date of the event
 * @param endDate The end date of the event
 * @returns The event status
 */
const getStatusFromDates = (startDate: string, endDate: string): Event['status'] => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : start + 24 * 60 * 60 * 1000; // Default to 24 hours after start
  
  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'past';
  }
};

/**
 * Convert Outsavvy event to the unified Event format
 * @param event The Outsavvy event
 * @returns The converted Event
 */
const convertOutsavvyToEvent = (event: OutsavvyEvent): Event => {
  // Determine status based on start and end dates
  const status = getStatusFromDates(event.startDate, event.endDate);
  
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      name: event.locationName,
      address: event.locationAddress,
      type: event.locationType === 'online' ? 'virtual' : event.locationType,
      isOnline: event.isOnline
    },
    organizer: event.organizerName,
    attendees: 0, // This data might not be available from Outsavvy
    capacity: 0, // This data might not be available from Outsavvy
    status,
    category: event.category,
    approvalStatus: event.approvalStatus,
    imageUrl: event.imageUrl,
    websiteUrl: event.websiteUrl,
    ticketUrl: event.ticketUrl,
    priceInfo: event.priceInfo,
    source: 'outsavvy',
    externalId: event.externalId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};

/**
 * Maps Eventbrite location type to our Event location type
 * @param locationType Eventbrite location type ('online', 'in-person', 'hybrid')
 * @returns Event location type ('virtual', 'in-person', 'hybrid')
 */
const mapEventbriteLocationTypeToEventType = (locationType: 'online' | 'in-person' | 'hybrid'): 'virtual' | 'in-person' | 'hybrid' => {
  if (locationType === 'online') {
    return 'virtual';
  }
  return locationType;
};

/**
 * Maps Airtable location type to our Event location type
 * @param locationType Airtable location type (string)
 * @returns Event location type ('virtual', 'in-person', 'hybrid')
 */
const mapAirtableLocationTypeToEventType = (locationType: string | undefined): 'virtual' | 'in-person' | 'hybrid' => {
  if (!locationType) return 'in-person';
  
  if (locationType.toLowerCase() === 'online' || locationType.toLowerCase() === 'virtual') {
    return 'virtual';
  } else if (locationType.toLowerCase() === 'hybrid') {
    return 'hybrid';
  } else {
    return 'in-person';
  }
};

/**
 * Maps our Event location type to Airtable format
 * @param locationType Event location type ('virtual', 'in-person', 'hybrid')
 * @returns Airtable location type (string)
 */
const mapEventLocationTypeToAirtable = (locationType: 'virtual' | 'in-person' | 'hybrid'): string => {
  if (locationType === 'virtual') {
    return 'online';
  }
  return locationType;
};

export default {
  getAllEvents,
  getEventsByStatus,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  createEvent,
  updateEvent,
  getEventById
};