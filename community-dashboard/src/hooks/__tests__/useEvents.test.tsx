import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvents } from '../useEvents';
import eventsService from '../../services/events';

// Mock the events service
jest.mock('../../services/events');

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load events on mount', async () => {
    // Setup mock return value
    const mockEvents = [
      {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        startDate: '2023-06-15T00:00:00.000Z',
        endDate: '2023-06-15T02:00:00.000Z',
        location: {
          name: 'Test Location',
          address: 'Test Address',
          type: 'in-person',
          isOnline: false,
        },
        organizer: 'Test Organizer',
        attendees: 10,
        capacity: 20,
        status: 'upcoming',
        category: 'test',
        approvalStatus: 'approved',
        source: 'eventbrite',
        createdAt: '2023-06-01T00:00:00.000Z',
        updatedAt: '2023-06-01T00:00:00.000Z',
      },
    ];

    // Mock the getAllEvents function
    (eventsService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);

    // Render the hook
    const { result } = renderHook(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify the events were loaded
    expect(eventsService.getAllEvents).toHaveBeenCalledTimes(1);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when loading events', async () => {
    // Mock the getAllEvents function to throw an error
    (eventsService.getAllEvents as jest.Mock).mockRejectedValue(new Error('Failed to load events'));

    // Render the hook
    const { result } = renderHook(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify the error state
    expect(result.current.error).toBe('Failed to load events. Please try again later.');
    expect(result.current.events).toEqual([]);
  });

  it('should approve an event', async () => {
    // Setup mock return value for approveEvent
    const approvedEvent = {
      id: '1',
      title: 'Test Event',
      description: 'Test Description',
      startDate: '2023-06-15T00:00:00.000Z',
      endDate: '2023-06-15T02:00:00.000Z',
      location: {
        name: 'Test Location',
        address: 'Test Address',
        type: 'in-person',
        isOnline: false,
      },
      organizer: 'Test Organizer',
      attendees: 10,
      capacity: 20,
      status: 'upcoming',
      category: 'test',
      approvalStatus: 'approved',
      source: 'eventbrite',
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z',
    };

    // Mock initial state
    (eventsService.getAllEvents as jest.Mock).mockResolvedValue([]);
    (eventsService.approveEvent as jest.Mock).mockResolvedValue(approvedEvent);

    // Render the hook
    const { result } = renderHook(() => useEvents());

    // Wait for the initial load to complete
    await waitFor(() => expect(eventsService.getAllEvents).toHaveBeenCalledTimes(1));

    // Approve an event
    await act(async () => {
      await result.current.approveEvent('1', 'eventbrite');
    });

    // Verify the event was approved
    expect(eventsService.approveEvent).toHaveBeenCalledWith('1', 'eventbrite');
    expect(result.current.events).toEqual([approvedEvent]);
  });

  it('should reject an event', async () => {
    // Setup mock return values
    const pendingEvents = [
      {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        startDate: '2023-06-15T00:00:00.000Z',
        endDate: '2023-06-15T02:00:00.000Z',
        location: {
          name: 'Test Location',
          address: 'Test Address',
          type: 'in-person',
          isOnline: false,
        },
        organizer: 'Test Organizer',
        attendees: 10,
        capacity: 20,
        status: 'upcoming',
        category: 'test',
        approvalStatus: 'pending',
        source: 'eventbrite',
        createdAt: '2023-06-01T00:00:00.000Z',
        updatedAt: '2023-06-01T00:00:00.000Z',
      },
    ];

    // Mock initial state and service calls
    (eventsService.getAllEvents as jest.Mock).mockResolvedValue([]);
    (eventsService.getPendingEvents as jest.Mock).mockResolvedValue(pendingEvents);
    (eventsService.rejectEvent as jest.Mock).mockResolvedValue({ success: true });

    // Render the hook
    const { result } = renderHook(() => useEvents());

    // Wait for the initial load to complete
    await waitFor(() => expect(eventsService.getAllEvents).toHaveBeenCalledTimes(1));

    // Load pending events
    await act(async () => {
      await result.current.loadPendingEvents();
    });

    // Verify pending events were loaded
    expect(result.current.pendingEvents).toEqual(pendingEvents);

    // Reject an event
    await act(async () => {
      await result.current.rejectEvent('1', 'eventbrite');
    });

    // Verify the event was rejected and removed from pending
    expect(eventsService.rejectEvent).toHaveBeenCalledWith('1', 'eventbrite');
    expect(result.current.pendingEvents).toEqual([]);
  });
});