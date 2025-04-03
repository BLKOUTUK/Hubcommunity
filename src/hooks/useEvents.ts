import { useState, useEffect } from 'react';
import { scrapeEvents, integrateWithCalendar, Event, CalendarIntegrationResult } from '../services/eventScraperService';

const DEFAULT_SOURCE_URL = 'https://api.blkout.community/events';

export const useEvents = (sourceUrl: string = DEFAULT_SOURCE_URL) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const scrapedEvents = await scrapeEvents(sourceUrl);
        if (scrapedEvents) {
          setEvents(scrapedEvents);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        setError('An error occurred while fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sourceUrl]);

  const addToCalendar = async (event: Event): Promise<CalendarIntegrationResult> => {
    try {
      return await integrateWithCalendar(event);
    } catch (err) {
      return {
        success: false,
        error: 'Failed to add event to calendar'
      };
    }
  };

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const scrapedEvents = await scrapeEvents(sourceUrl);
      if (scrapedEvents) {
        setEvents(scrapedEvents);
      } else {
        setError('Failed to refresh events');
      }
    } catch (err) {
      setError('An error occurred while refreshing events');
    } finally {
      setLoading(false);
    }
  };

  const registerUserForEvent = async (eventId: string, userId: string) => {
    try {
      // Implementation for registering user for event
      // This would typically make an API call to your backend
      console.log(`Registering user ${userId} for event ${eventId}`);
      return true;
    } catch (err) {
      console.error('Failed to register for event:', err);
      return false;
    }
  };

  return {
    events,
    loading,
    error,
    addToCalendar,
    refreshEvents,
    registerUserForEvent
  };
}; 