/**
 * The Lowdown API Client
 * 
 * This client provides methods to interact with The Lowdown API for event management
 * and calendar integration.
 */

import { logError, logInfo } from '../../services/errorLogging';

// Environment variables for Lowdown configuration
const lowdownApiKey = import.meta.env.VITE_LOWDOWN_API_KEY;
const lowdownApiUrl = import.meta.env.VITE_LOWDOWN_API_URL || 'https://api.thelowdown.com/v1';
const lowdownCalendarId = import.meta.env.VITE_LOWDOWN_CALENDAR_ID;

// Event types
export interface LowdownEvent {
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
  source: 'lowdown';
  createdAt: string;
  updatedAt: string;
  externalId: string;
}

// Check if required environment variables are set
if (!lowdownApiKey) {
  console.warn('Missing Lowdown API key. Check your .env file.');
}

/**
 * Fetch events from The Lowdown API
 * @param filters Optional filters for events
 * @returns Array of events
 */
export const getEvents = async (filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  locationType?: 'online' | 'in-person' | 'hybrid';
}): Promise<LowdownEvent[]> => {
  try {
    if (!lowdownApiKey) {
      throw new Error('Lowdown API key is not configured');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('start_date', filters.startDate);
    if (filters?.endDate) queryParams.append('end_date', filters.endDate);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.locationType) queryParams.append('location_type', filters.locationType);

    const response = await fetch(`${lowdownApiUrl}/calendars/${lowdownCalendarId}/events?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${lowdownApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lowdown API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events.map(transformLowdownToEvent);
  } catch (error) {
    logError('Error fetching events from Lowdown', error);
    throw error;
  }
};

/**
 * Transform Lowdown API event to our event format
 */
const transformLowdownToEvent = (event: any): LowdownEvent => {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date,
    locationName: event.location?.name || 'Online',
    locationAddress: event.location?.address || '',
    locationType: event.is_online ? 'online' : 'in-person',
    isOnline: event.is_online,
    category: event.category || 'uncategorized',
    isBlkoutEvent: event.organizer?.name?.toLowerCase().includes('blkout') || false,
    approvalStatus: 'pending',
    organizerName: event.organizer?.name || '',
    imageUrl: event.image_url || '',
    websiteUrl: event.url || '',
    ticketUrl: event.ticket_url || event.url || '',
    priceInfo: event.is_free ? 'Free' : 'Paid',
    source: 'lowdown',
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    externalId: `lowdown-${event.id}`,
  };
}; 