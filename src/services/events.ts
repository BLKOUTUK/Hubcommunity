import { logError } from '../utils/error';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: 'workshop' | 'meetup' | 'conference' | 'other';
  capacity: number;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    // TODO: Implement actual API call
    return [
      {
        id: '1',
        title: 'Introduction to React',
        description: 'Learn the basics of React development',
        startTime: new Date('2023-12-01T10:00:00'),
        endTime: new Date('2023-12-01T12:00:00'),
        location: 'Online',
        type: 'workshop',
        capacity: 20,
        attendees: ['user1', 'user2'],
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Monthly Meetup',
        description: 'Community networking event',
        startTime: new Date('2023-12-15T18:00:00'),
        endTime: new Date('2023-12-15T20:00:00'),
        location: 'Community Hub',
        type: 'meetup',
        capacity: 50,
        attendees: ['user3', 'user4', 'user5'],
        status: 'upcoming'
      }
    ];
  } catch (error) {
    logError(error, 'getEvents');
    throw error;
  }
};

export const createEvent = async (event: Omit<Event, 'id' | 'attendees' | 'status'>): Promise<Event> => {
  try {
    // TODO: Implement actual API call
    return {
      ...event,
      id: Math.random().toString(36).substring(7),
      attendees: [],
      status: 'upcoming'
    };
  } catch (error) {
    logError(error, 'createEvent');
    throw error;
  }
};

export const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<Event> => {
  try {
    const events = await getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    return {
      ...event,
      ...updates
    };
  } catch (error) {
    logError(error, 'updateEvent');
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    // TODO: Implement actual API call
    console.log(`Deleting event ${eventId}`);
  } catch (error) {
    logError(error, 'deleteEvent');
    throw error;
  }
};

export const registerForEvent = async (eventId: string, userId: string): Promise<Event> => {
  try {
    const event = await updateEvent(eventId, {});
    if (event.attendees.includes(userId)) {
      throw new Error('User already registered for this event');
    }
    if (event.attendees.length >= event.capacity) {
      throw new Error('Event is at capacity');
    }
    return updateEvent(eventId, {
      attendees: [...event.attendees, userId]
    });
  } catch (error) {
    logError(error, 'registerForEvent');
    throw error;
  }
}; 