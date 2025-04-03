import { useState, useEffect, useCallback } from 'react';
import eventsService, { Event } from '../services/events';
import { logError } from '../services/errorLogging';

/**
 * Hook for managing events data
 * 
 * This hook provides methods to fetch, create, update, and manage events
 * from various sources (Airtable, Eventbrite, etc.)
 */
export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all approved events
   */
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsService.getAllEvents();
      setEvents(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error loading events');
      logError(errorObj);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load events by status (upcoming, ongoing, past)
   * @param status The status of events to fetch
   */
  const loadEventsByStatus = useCallback(async (status: 'upcoming' | 'ongoing' | 'past') => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsService.getEventsByStatus(status);
      setEvents(data);
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error(`Error loading ${status} events`);
      logError(errorObj);
      setError(`Failed to load ${status} events. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load pending events that need approval
   */
  const loadPendingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsService.getPendingEvents();
      setPendingEvents(data);
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error('Error loading pending events');
      logError(errorObj);
      setError('Failed to load pending events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new event
   * @param eventData The event data to create
   */
  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const createdEvent = await eventsService.createEvent(eventData);
      setEvents(prev => [...prev, createdEvent]);
      return createdEvent;
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error('Error creating event');
      logError(errorObj);
      setError('Failed to create event. Please try again later.');
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing event
   * @param eventId The ID of the event to update
   * @param eventData The updated event data
   */
  const updateEvent = useCallback(async (eventId: string, eventData: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await eventsService.updateEvent(eventId, eventData);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error(`Error updating event ${eventId}`);
      logError(errorObj);
      setError('Failed to update event. Please try again later.');
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve a pending event
   * @param eventId The ID of the event to approve
   * @param source The source of the event
   */
  const approveEvent = useCallback(async (eventId: string, source: string) => {
    try {
      setLoading(true);
      setError(null);
      const approvedEvent = await eventsService.approveEvent(eventId, source);
      
      // Update events list with the approved event
      setEvents(prev => [...prev, approvedEvent]);
      
      // Remove from pending events
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      
      return approvedEvent;
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error(`Error approving event ${eventId}`);
      logError(errorObj);
      setError('Failed to approve event. Please try again later.');
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reject a pending event
   * @param eventId The ID of the event to reject
   * @param source The source of the event
   */
  const rejectEvent = useCallback(async (eventId: string, source: string) => {
    try {
      setLoading(true);
      setError(null);
      await eventsService.rejectEvent(eventId, source);
      
      // Remove from pending events
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      const errorObj = err instanceof Error 
        ? err 
        : new Error(`Error rejecting event ${eventId}`);
      logError(errorObj);
      setError('Failed to reject event. Please try again later.');
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    pendingEvents,
    loading,
    error,
    loadEvents,
    loadEventsByStatus,
    loadPendingEvents,
    createEvent,
    updateEvent,
    approveEvent,
    rejectEvent,
  };
};

export default useEvents;