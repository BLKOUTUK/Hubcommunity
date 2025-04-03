import { 
  scrapeEvents,
  parseEventData,
  validateEvent,
  integrateWithCalendar
} from '../eventScraperService';

describe('Event Scraper Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('scrapeEvents', () => {
    it('scrapes events from source', async () => {
      const source = 'https://example.com/events';
      const events = await scrapeEvents(source);

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(event.title).toBeDefined();
        expect(event.description).toBeDefined();
        expect(event.startTime).toBeDefined();
        expect(event.endTime).toBeDefined();
        expect(event.location).toBeDefined();
      });
    });

    it('handles invalid source URL', async () => {
      const source = 'invalid-url';
      const events = await scrapeEvents(source);

      expect(events).toBeNull();
    });

    it('handles empty event list', async () => {
      const source = 'https://example.com/no-events';
      const events = await scrapeEvents(source);

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });
  });

  describe('parseEventData', () => {
    it('parses raw event data correctly', () => {
      const rawData = {
        title: 'Test Event',
        description: 'Test Description',
        start: '2024-03-20T18:00:00Z',
        end: '2024-03-20T20:00:00Z',
        location: 'Test Location'
      };

      const parsedEvent = parseEventData(rawData);

      expect(parsedEvent.title).toBe('Test Event');
      expect(parsedEvent.description).toBe('Test Description');
      expect(parsedEvent.startTime).toBe('2024-03-20T18:00:00Z');
      expect(parsedEvent.endTime).toBe('2024-03-20T20:00:00Z');
      expect(parsedEvent.location).toBe('Test Location');
    });

    it('handles missing optional fields', () => {
      const rawData = {
        title: 'Test Event',
        start: '2024-03-20T18:00:00Z',
        end: '2024-03-20T20:00:00Z'
      };

      const parsedEvent = parseEventData(rawData);

      expect(parsedEvent.title).toBe('Test Event');
      expect(parsedEvent.description).toBe('');
      expect(parsedEvent.location).toBe('');
    });

    it('handles invalid date formats', () => {
      const rawData = {
        title: 'Test Event',
        start: 'invalid-date',
        end: 'invalid-date'
      };

      const parsedEvent = parseEventData(rawData);

      expect(parsedEvent.startTime).toBeNull();
      expect(parsedEvent.endTime).toBeNull();
    });
  });

  describe('validateEvent', () => {
    it('validates complete event data', () => {
      const event = {
        title: 'Test Event',
        description: 'Test Description',
        startTime: '2024-03-20T18:00:00Z',
        endTime: '2024-03-20T20:00:00Z',
        location: 'Test Location'
      };

      const validation = validateEvent(event);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const event = {
        description: 'Test Description',
        startTime: '2024-03-20T18:00:00Z',
        endTime: '2024-03-20T20:00:00Z'
      };

      const validation = validateEvent(event);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });

    it('validates date ranges', () => {
      const event = {
        title: 'Test Event',
        description: 'Test Description',
        startTime: '2024-03-20T20:00:00Z',
        endTime: '2024-03-20T18:00:00Z',
        location: 'Test Location'
      };

      const validation = validateEvent(event);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('End time must be after start time');
    });
  });

  describe('integrateWithCalendar', () => {
    it('successfully integrates event with calendar', async () => {
      const event = {
        title: 'Test Event',
        description: 'Test Description',
        startTime: '2024-03-20T18:00:00Z',
        endTime: '2024-03-20T20:00:00Z',
        location: 'Test Location'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(true);
      expect(result.calendarEventId).toBeDefined();
      expect(result.googleEventId).toBeDefined();
    });

    it('handles calendar integration errors', async () => {
      const event = {
        title: 'Invalid Event',
        description: 'Test Description',
        startTime: 'invalid-date',
        endTime: 'invalid-date',
        location: 'Test Location'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles duplicate events', async () => {
      const event = {
        title: 'Duplicate Event',
        description: 'Test Description',
        startTime: '2024-03-20T18:00:00Z',
        endTime: '2024-03-20T20:00:00Z',
        location: 'Test Location'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('duplicate');
    });
  });
}); 