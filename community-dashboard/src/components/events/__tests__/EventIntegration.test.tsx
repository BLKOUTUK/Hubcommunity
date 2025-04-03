import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventIntegration } from '../EventIntegration';
import { useAuth } from '../../../contexts/AuthContext';
import {
  scrapeEvents,
  parseEventData,
  validateEvent,
  integrateWithCalendar
} from '../../../services/eventScraperService';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the event scraper service
jest.mock('../../../services/eventScraperService', () => ({
  scrapeEvents: jest.fn(),
  parseEventData: jest.fn(),
  validateEvent: jest.fn(),
  integrateWithCalendar: jest.fn()
}));

describe('EventIntegration Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  const mockEvent = {
    title: 'Test Event',
    description: 'Test Description',
    startTime: '2024-03-20T18:00:00Z',
    endTime: '2024-03-20T20:00:00Z',
    location: 'Test Location'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (scrapeEvents as jest.Mock).mockResolvedValue([mockEvent]);
    (parseEventData as jest.Mock).mockReturnValue(mockEvent);
    (validateEvent as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
    (integrateWithCalendar as jest.Mock).mockResolvedValue({
      success: true,
      calendarEventId: '123',
      googleEventId: '456'
    });
  });

  it('renders event integration form', () => {
    render(<EventIntegration />);
    
    expect(screen.getByText('Event Integration')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Source URL')).toBeInTheDocument();
    expect(screen.getByText('Scrape Events')).toBeInTheDocument();
  });

  it('scrapes events from source', async () => {
    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('validates scraped events', async () => {
    (validateEvent as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Invalid date format']
    });

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Found 0 valid events')).toBeInTheDocument();
    });
  });

  it('integrates valid events with calendar', async () => {
    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    const integrateButton = await screen.findByText('Integrate with Calendar');
    
    await act(async () => {
      fireEvent.click(integrateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Event integrated successfully')).toBeInTheDocument();
    });
  });

  it('handles integration errors', async () => {
    (integrateWithCalendar as jest.Mock).mockRejectedValue(new Error('Integration failed'));

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    const integrateButton = await screen.findByText('Integrate with Calendar');
    
    await act(async () => {
      fireEvent.click(integrateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to integrate event')).toBeInTheDocument();
    });
  });

  it('shows loading state during scraping', async () => {
    (scrapeEvents as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    expect(screen.getByText('Scraping events...')).toBeInTheDocument();
  });

  it('handles empty URL submission', async () => {
    render(<EventIntegration />);
    
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });
  });

  it('handles multiple events with some invalid', async () => {
    const validEvent = { ...mockEvent };
    const invalidEvent = {
      ...mockEvent,
      startTime: 'invalid-date'
    };

    (scrapeEvents as jest.Mock).mockResolvedValue([validEvent, invalidEvent]);
    (validateEvent as jest.Mock).mockImplementation((event) => ({
      isValid: event.startTime !== 'invalid-date',
      errors: event.startTime === 'invalid-date' ? ['Invalid date format'] : []
    }));

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Found 1 valid events')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('handles network errors during scraping', async () => {
    (scrapeEvents as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to scrape events')).toBeInTheDocument();
    });
  });

  it('handles partial event data', async () => {
    const partialEvent = {
      title: 'Test Event',
      startTime: '2024-03-20T18:00:00Z',
      endTime: '2024-03-20T20:00:00Z'
    };

    (scrapeEvents as jest.Mock).mockResolvedValue([partialEvent]);
    (parseEventData as jest.Mock).mockReturnValue({
      ...partialEvent,
      description: '',
      location: ''
    });

    render(<EventIntegration />);
    
    const urlInput = screen.getByLabelText('Event Source URL');
    const scrapeButton = screen.getByText('Scrape Events');

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com/events' } });
      fireEvent.click(scrapeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Found 1 valid events')).toBeInTheDocument();
    });
  });

  it('handles unauthorized access attempts', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<EventIntegration />);
    
    expect(screen.getByText('Admin access required')).toBeInTheDocument();
  });

  it('handles non-admin user access', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      user: { ...mockUser, role: 'user' } 
    });

    render(<EventIntegration />);
    
    expect(screen.getByText('Admin access required')).toBeInTheDocument();
  });
}); 