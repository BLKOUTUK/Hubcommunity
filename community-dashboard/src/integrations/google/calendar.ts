import { LowdownEvent } from '../lowdown/client';
import { logError } from '../../services/errorLogging';

// Google Calendar API configuration
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  status: string;
  htmlLink: string;
}

/**
 * Sync events from The Lowdown to Google Calendar
 */
export const syncEventsToGoogleCalendar = async (events: LowdownEvent[]): Promise<void> => {
  try {
    if (!GOOGLE_CALENDAR_ID || !GOOGLE_API_KEY) {
      throw new Error('Google Calendar configuration is missing');
    }

    for (const event of events) {
      const googleEvent = transformToGoogleEvent(event);
      await createOrUpdateGoogleEvent(googleEvent);
    }
  } catch (error) {
    logError('Error syncing events to Google Calendar', { error });
    throw error;
  }
};

/**
 * Transform Lowdown event to Google Calendar event format
 */
const transformToGoogleEvent = (event: LowdownEvent): GoogleCalendarEvent => {
  return {
    id: `lowdown-${event.id}`,
    summary: event.title,
    description: `${event.description}\n\nOrganizer: ${event.organizerName}\nCategory: ${event.category}\nPrice: ${event.priceInfo}\n\nMore info: ${event.websiteUrl}`,
    start: {
      dateTime: event.startDate,
      timeZone: 'Europe/London', // Default to London timezone
    },
    end: {
      dateTime: event.endDate,
      timeZone: 'Europe/London',
    },
    location: event.locationType === 'online' ? 'Online' : event.locationAddress,
    status: 'confirmed',
    htmlLink: event.websiteUrl,
  };
};

/**
 * Create or update an event in Google Calendar
 */
const createOrUpdateGoogleEvent = async (event: GoogleCalendarEvent): Promise<void> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events/${event.id}?key=${GOOGLE_API_KEY}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to sync event: ${response.statusText}`);
    }
  } catch (error) {
    logError('Error creating/updating Google Calendar event', { error, event });
    throw error;
  }
};

/**
 * Get the public Google Calendar embed URL
 */
export const getCalendarEmbedUrl = (): string => {
  if (!GOOGLE_CALENDAR_ID) {
    throw new Error('Google Calendar ID is not configured');
  }
  return `https://calendar.google.com/calendar/embed?src=${GOOGLE_CALENDAR_ID}&ctz=Europe%2FLondon`;
}; 