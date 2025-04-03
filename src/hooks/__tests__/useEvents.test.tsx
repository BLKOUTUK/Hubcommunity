import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvents } from '../useEvents';
import * as eventsService from '../../services/events';
import { logError } from '../../utils/error';
import { scrapeEvents, integrateWithCalendar } from '../../services/eventScraperService';

// Mock the events service
jest.mock('../../services/events', () => ({
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  registerForEvent: jest.fn()
}));

// Mock the error utility
jest.mock('../../utils/error', () => ({
  logError: jest.fn()
}));

// Mock the eventScraperService
jest.mock('../../services/eventScraperService', () => ({
  scrapeEvents: jest.fn(),
  integrateWithCalendar: jest.fn()
}));

describe('useEvents hook', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      description: 'Test Description 1',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      location: 'Test Location 1',
      type: 'workshop' as const,
      capacity: 20,
      attendees: [],
      status: 'upcoming' as const
    },
    {
      id: '2',
      title: 'Test Event 2',
      description: 'Test Description 2',
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      location: 'Test Location 2',
      type: 'meetup' as const,
      capacity: 30,
      attendees: [],
      status: 'upcoming' as const
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches events on mount', async () => {
    (eventsService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    const { result } = renderHook(() => useEvents());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.events).toEqual(mockEvents);
    });
  });

  it('handles error when fetching events', async () => {
    const error = new Error('Failed to fetch events');
    (eventsService.getEvents as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch events');
      expect(logError).toHaveBeenCalledWith(error, 'useEvents');
    });
  });

  it('adds a new event', async () => {
    const newEvent = {
      title: 'New Event',
      description: 'New Description',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      location: 'New Location',
      type: 'workshop' as const,
      capacity: 10
    };

    (eventsService.createEvent as jest.Mock).mockResolvedValue({
      ...newEvent,
      id: '3',
      attendees: [],
      status: 'upcoming' as const
    });

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.addEvent(newEvent);
    });

    expect(eventsService.createEvent).toHaveBeenCalledWith(newEvent);
    expect(result.current.events).toContainEqual(expect.objectContaining(newEvent));
  });

  it('updates an existing event', async () => {
    const updatedEvent = {
      ...mockEvents[0],
      title: 'Updated Event Title'
    };

    (eventsService.updateEvent as jest.Mock).mockResolvedValue(updatedEvent);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.editEvent(updatedEvent.id, updatedEvent);
    });

    expect(eventsService.updateEvent).toHaveBeenCalledWith(updatedEvent.id, updatedEvent);
    expect(result.current.events).toContainEqual(updatedEvent);
  });

  it('deletes an event', async () => {
    (eventsService.deleteEvent as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.removeEvent('1');
    });

    expect(eventsService.deleteEvent).toHaveBeenCalledWith('1');
    expect(result.current.events).not.toContainEqual(
      expect.objectContaining({ id: '1' })
    );
  });

  it('registers a user for an event', async () => {
    const userId = 'user123';
    const eventId = '1';

    (eventsService.registerForEvent as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.registerUserForEvent(eventId, userId);
    });

    expect(eventsService.registerForEvent).toHaveBeenCalledWith(eventId, userId);
  });

  it('refreshes events', async () => {
    (eventsService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.refreshEvents();
    });

    expect(eventsService.getEvents).toHaveBeenCalled();
    expect(result.current.events).toEqual(mockEvents);
  });

  it('should fetch events successfully', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
        location: 'Test Location',
        url: 'https://example.com/event/1'
      }
    ];

    (scrapeEvents as jest.Mock).mockResolvedValue(mockEvents);

    const { result } = renderHook(() => useEvents('https://example.com/events'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.events).toEqual(mockEvents);
  });

  it('should handle fetch errors', async () => {
    (scrapeEvents as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useEvents('https://example.com/events'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch events');
    expect(result.current.events).toEqual([]);
  });

  it('should add event to calendar successfully', async () => {
    const mockEvent = {
      id: '1',
      title: 'Test Event',
      description: 'Test Description',
      date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
      location: 'Test Location',
      url: 'https://example.com/event/1'
    };

    (integrateWithCalendar as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useEvents('https://example.com/events'));

    let integrationResult;
    await act(async () => {
      integrationResult = await result.current.addToCalendar(mockEvent);
    });

    expect(integrationResult).toEqual({ success: true });
  });

  it('should handle calendar integration errors', async () => {
    const mockEvent = {
      id: '1',
      title: 'Test Event',
      description: 'Test Description',
      date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
      location: 'Test Location',
      url: 'https://example.com/event/1'
    };

    (integrateWithCalendar as jest.Mock).mockRejectedValue(new Error('Integration failed'));

    const { result } = renderHook(() => useEvents('https://example.com/events'));

    let integrationResult;
    await act(async () => {
      integrationResult = await result.current.addToCalendar(mockEvent);
    });

    expect(integrationResult).toEqual({
      success: false,
      error: 'Failed to add event to calendar'
    });
  });
}); 