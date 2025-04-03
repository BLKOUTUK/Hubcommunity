import { scrapeEvents, parseEventData, integrateWithCalendar } from '../eventScraperService';

describe('Event Scraper Service', () => {
  describe('scrapeEvents', () => {
    it('scrapes events from source', async () => {
      const source = 'https://example.com/events';
      const events = await scrapeEvents(source);

      expect(events).toBeInstanceOf(Array);
      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty('title');
      expect(events[0]).toHaveProperty('description');
      expect(events[0]).toHaveProperty('date');
      expect(events[0]).toHaveProperty('location');
      expect(events[0]).toHaveProperty('url');
    });

    it('handles invalid source URL', async () => {
      const source = 'invalid-url';
      const events = await scrapeEvents(source);

      expect(events).toBeNull();
    });
  });

  describe('parseEventData', () => {
    it('parses valid event data', () => {
      const rawData = {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
        location: 'Test Location',
        url: 'https://example.com/event/1'
      };

      const parsedEvent = parseEventData(rawData);

      expect(parsedEvent).toEqual(rawData);
    });

    it('handles missing fields', () => {
      const rawData = {};
      const parsedEvent = parseEventData(rawData);

      expect(parsedEvent).toHaveProperty('id');
      expect(parsedEvent).toHaveProperty('title');
      expect(parsedEvent).toHaveProperty('description');
      expect(parsedEvent).toHaveProperty('date');
      expect(parsedEvent).toHaveProperty('location');
      expect(parsedEvent).toHaveProperty('url');
    });
  });

  describe('integrateWithCalendar', () => {
    it('successfully integrates event with calendar', async () => {
      const event = {
        id: '1',
        title: 'Test Event',
        description: 'Test Description',
        date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
        location: 'Test Location',
        url: 'https://example.com/event/1'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('handles duplicate events', async () => {
      const event = {
        id: '1',
        title: 'duplicate Test Event',
        description: 'Test Description',
        date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
        location: 'Test Location',
        url: 'https://example.com/event/1'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('handles integration errors', async () => {
      const event = {
        id: '1',
        title: 'Error Test Event',
        description: 'Test Description',
        date: '20/03/2024, 18:00:00 - 20/03/2024, 20:00:00',
        location: 'Test Location',
        url: 'https://example.com/event/1'
      };

      const result = await integrateWithCalendar(event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 