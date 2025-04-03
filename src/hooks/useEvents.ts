import { useState, useEffect } from 'react';
import { scrapeEvents, integrateWithCalendar, Event, CalendarIntegrationResult } from '../services/eventScraperService';

export const useEvents = (sourceUrl: string) => {
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

  return {
    events,
    loading,
    error,
    addToCalendar
  };
}; 