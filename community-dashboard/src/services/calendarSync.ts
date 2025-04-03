import { getEvents } from '../integrations/lowdown/client';
import { syncEventsToGoogleCalendar } from '../integrations/google/calendar';
import { logError } from './errorLogging';

/**
 * Sync events from The Lowdown to Google Calendar
 */
export const syncCalendars = async (): Promise<void> => {
  try {
    // Get events from The Lowdown
    const events = await getEvents();
    
    // Sync events to Google Calendar
    await syncEventsToGoogleCalendar(events);
    
    console.log('Calendar sync completed successfully');
  } catch (error) {
    logError('Error syncing calendars', { error });
    throw error;
  }
};

/**
 * Schedule regular calendar syncs
 */
export const scheduleCalendarSync = (intervalMinutes: number = 60): void => {
  // Initial sync
  syncCalendars().catch(error => {
    console.error('Initial calendar sync failed:', error);
  });

  // Schedule regular syncs
  setInterval(() => {
    syncCalendars().catch(error => {
      console.error('Scheduled calendar sync failed:', error);
    });
  }, intervalMinutes * 60 * 1000);
}; 