/**
 * Community Service
 * 
 * This service provides methods for interacting with community data stored in Airtable,
 * including members, events, and resources.
 */

import airtableClient from '../integrations/airtable/client';
import { logError, logMessage } from './errorLogging';

/**
 * Community member interface
 */
export interface CommunityMember {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  tags?: string[];
  avatar?: string;
  featured?: boolean;
  joinDate?: string;
  email?: string;
  supabaseUserId?: string;
}

/**
 * Event interface
 */
export interface Event {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  location?: string;
  organizerId?: string;
  registrationLink?: string;
  targetAudience?: string[];
}

/**
 * Resource interface
 */
export interface Resource {
  id: string;
  title: string;
  description?: string;
  resourceType?: string;
  link?: string;
  tags?: string[];
  contributorId?: string;
}

/**
 * Get featured community members
 * @returns Array of featured community members
 */
export const getFeaturedMembers = async (): Promise<CommunityMember[]> => {
  try {
    const records = await airtableClient.getRecords('CommunityMembers', {
      filterByFormula: '{IsFeatured} = TRUE()',
      sort: [{ field: 'Name', direction: 'asc' }],
    });
    
    return records as CommunityMember[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch featured members');
    logError(errorObj);
    return [];
  }
};

/**
 * Get new community members (joined in the last 30 days)
 * @returns Array of new community members
 */
export const getNewMembers = async (): Promise<CommunityMember[]> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const records = await airtableClient.getRecords('CommunityMembers', {
      filterByFormula: `{CreatedAt} >= '${formattedDate}'`,
      sort: [{ field: 'CreatedAt', direction: 'desc' }],
    });
    
    return records as CommunityMember[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch new members');
    logError(errorObj);
    return [];
  }
};

/**
 * Get all community members
 * @returns Array of all community members
 */
export const getAllMembers = async (): Promise<CommunityMember[]> => {
  try {
    const records = await airtableClient.getRecords('CommunityMembers', {
      sort: [{ field: 'Name', direction: 'asc' }],
    });
    
    return records as CommunityMember[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch all members');
    logError(errorObj);
    return [];
  }
};

/**
 * Get a community member by ID
 * @param memberId - The member's ID
 * @returns The community member
 */
export const getMemberById = async (memberId: string): Promise<CommunityMember | null> => {
  try {
    const record = await airtableClient.getRecord('CommunityMembers', memberId);
    return record as CommunityMember;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch member');
    logError(errorObj, { memberId });
    return null;
  }
};

/**
 * Get a community member by Supabase user ID
 * @param supabaseUserId - The Supabase user ID
 * @returns The community member
 */
export const getMemberBySupabaseId = async (supabaseUserId: string): Promise<CommunityMember | null> => {
  try {
    const records = await airtableClient.getRecords('CommunityMembers', {
      filterByFormula: `{SupabaseUserId} = '${supabaseUserId}'`,
    });
    
    if (records.length === 0) {
      return null;
    }
    
    return records[0] as CommunityMember;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch member by Supabase ID');
    logError(errorObj, { supabaseUserId });
    return null;
  }
};

/**
 * Create a new community member
 * @param member - The member data
 * @returns The created member
 */
export const createMember = async (member: Omit<CommunityMember, 'id'>): Promise<CommunityMember> => {
  try {
    const record = await airtableClient.createRecord('CommunityMembers', member);
    logMessage(`Created new community member: ${member.name}`, 'info');
    return record as CommunityMember;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to create member');
    logError(errorObj, { member });
    throw errorObj;
  }
};

/**
 * Update a community member
 * @param memberId - The member's ID
 * @param member - The member data to update
 * @returns The updated member
 */
export const updateMember = async (
  memberId: string,
  member: Partial<Omit<CommunityMember, 'id'>>
): Promise<CommunityMember> => {
  try {
    const record = await airtableClient.updateRecord('CommunityMembers', memberId, member);
    logMessage(`Updated community member: ${memberId}`, 'info');
    return record as CommunityMember;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to update member');
    logError(errorObj, { memberId, member });
    throw errorObj;
  }
};

/**
 * Get upcoming events
 * @param limit - Maximum number of events to return
 * @returns Array of upcoming events
 */
export const getUpcomingEvents = async (limit = 10): Promise<Event[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = await airtableClient.getRecords('Events', {
      filterByFormula: `{EventDate} >= '${today}'`,
      sort: [{ field: 'EventDate', direction: 'asc' }],
      maxRecords: limit,
    });
    
    return records as Event[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch upcoming events');
    logError(errorObj);
    return [];
  }
};

/**
 * Get all events
 * @returns Array of all events
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const records = await airtableClient.getRecords('Events', {
      sort: [{ field: 'EventDate', direction: 'desc' }],
    });
    
    return records as Event[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch all events');
    logError(errorObj);
    return [];
  }
};

/**
 * Get an event by ID
 * @param eventId - The event's ID
 * @returns The event
 */
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const record = await airtableClient.getRecord('Events', eventId);
    return record as Event;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch event');
    logError(errorObj, { eventId });
    return null;
  }
};

/**
 * Create a new event
 * @param event - The event data
 * @returns The created event
 */
export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const record = await airtableClient.createRecord('Events', event);
    logMessage(`Created new event: ${event.name}`, 'info');
    return record as Event;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to create event');
    logError(errorObj, { event });
    throw errorObj;
  }
};

/**
 * Update an event
 * @param eventId - The event's ID
 * @param event - The event data to update
 * @returns The updated event
 */
export const updateEvent = async (
  eventId: string,
  event: Partial<Omit<Event, 'id'>>
): Promise<Event> => {
  try {
    const record = await airtableClient.updateRecord('Events', eventId, event);
    logMessage(`Updated event: ${eventId}`, 'info');
    return record as Event;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to update event');
    logError(errorObj, { eventId, event });
    throw errorObj;
  }
};

/**
 * Get resources by type
 * @param resourceType - The resource type
 * @returns Array of resources
 */
export const getResourcesByType = async (resourceType: string): Promise<Resource[]> => {
  try {
    const records = await airtableClient.getRecords('Resources', {
      filterByFormula: `{ResourceType} = '${resourceType}'`,
      sort: [{ field: 'Title', direction: 'asc' }],
    });
    
    return records as Resource[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch resources by type');
    logError(errorObj, { resourceType });
    return [];
  }
};

/**
 * Get all resources
 * @returns Array of all resources
 */
export const getAllResources = async (): Promise<Resource[]> => {
  try {
    const records = await airtableClient.getRecords('Resources', {
      sort: [{ field: 'Title', direction: 'asc' }],
    });
    
    return records as Resource[];
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch all resources');
    logError(errorObj);
    return [];
  }
};

/**
 * Get a resource by ID
 * @param resourceId - The resource's ID
 * @returns The resource
 */
export const getResourceById = async (resourceId: string): Promise<Resource | null> => {
  try {
    const record = await airtableClient.getRecord('Resources', resourceId);
    return record as Resource;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to fetch resource');
    logError(errorObj, { resourceId });
    return null;
  }
};

/**
 * Create a new resource
 * @param resource - The resource data
 * @returns The created resource
 */
export const createResource = async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
  try {
    const record = await airtableClient.createRecord('Resources', resource);
    logMessage(`Created new resource: ${resource.title}`, 'info');
    return record as Resource;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to create resource');
    logError(errorObj, { resource });
    throw errorObj;
  }
};

/**
 * Update a resource
 * @param resourceId - The resource's ID
 * @param resource - The resource data to update
 * @returns The updated resource
 */
export const updateResource = async (
  resourceId: string,
  resource: Partial<Omit<Resource, 'id'>>
): Promise<Resource> => {
  try {
    const record = await airtableClient.updateRecord('Resources', resourceId, resource);
    logMessage(`Updated resource: ${resourceId}`, 'info');
    return record as Resource;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Failed to update resource');
    logError(errorObj, { resourceId, resource });
    throw errorObj;
  }
};