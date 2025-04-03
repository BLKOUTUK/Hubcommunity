import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvents } from '../useEvents';
import * as eventsService from '../../services/events';
import { logError } from '../../utils/error';
import { scrapeEvents, integrateWithCalendar, Event, CalendarIntegrationResult } from '../../services/eventScraperService';

// Mock the events service
jest.mock('../../services/events', () => ({
  getEvents: jest.fn(),
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

describe('useEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Test Event 1',
      description: 'Test Description 1',
      date: '2024-04-01',
      location: 'Test Location 1',
      url: 'https://test.com/event1'
    },
    {
      id: '2',
      title: 'Test Event 2',
      description: 'Test Description 2',
      date: '2024-04-02',
      location: 'Test Location 2',
      url: 'https://test.com/event2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch events on mount', async () => {
    (scrapeEvents as jest.Mock).mockResolvedValueOnce(mockEvents);

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when fetching events', async () => {
    const error = new Error('Failed to fetch events');
    (scrapeEvents as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('An error occurred while fetching events');
  });

  it('should handle null response from scrapeEvents', async () => {
    (scrapeEvents as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch events');
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

  it('should add event to calendar successfully', async () => {
    const mockCalendarResult: CalendarIntegrationResult = {
      success: true,
      error: undefined
    };
    (integrateWithCalendar as jest.Mock).mockResolvedValueOnce(mockCalendarResult);

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    const response = await result.current.addToCalendar(mockEvents[0]);

    expect(response).toEqual(mockCalendarResult);
    expect(integrateWithCalendar).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('should handle calendar integration error', async () => {
    const mockCalendarResult: CalendarIntegrationResult = {
      success: false,
      error: 'Failed to add event to calendar'
    };
    (integrateWithCalendar as jest.Mock).mockRejectedValueOnce(new Error('Calendar API error'));

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    const response = await result.current.addToCalendar(mockEvents[0]);

    expect(response).toEqual(mockCalendarResult);
  });

  it('should refresh events', async () => {
    (scrapeEvents as jest.Mock).mockResolvedValueOnce(mockEvents);

    const { result } = renderHook(() => useEvents('https://test.com/events'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    (scrapeEvents as jest.Mock).mockResolvedValueOnce([...mockEvents, {
      id: '3',
      title: 'Test Event 3',
      description: 'Test Description 3',
      date: '2024-04-03',
      location: 'Test Location 3',
      url: 'https://test.com/event3'
    }]);

    await act(async () => {
      await result.current.refreshEvents();
    });

    expect(result.current.events).toHaveLength(3);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
}); 