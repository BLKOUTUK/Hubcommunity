import { 
  createQuizEvent,
  createBrainTeaserEvent,
  syncEvents,
  getUpcomingEvents
} from '../googleCalendarService';

describe('Google Calendar Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('createQuizEvent', () => {
    it('creates weekly quiz event', async () => {
      const event = {
        title: 'Weekly Community Quiz',
        description: 'Join us for our weekly quiz!',
        startTime: new Date(),
        duration: 60 // minutes
      };

      const result = await createQuizEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.googleEventId).toBeDefined();
    });

    it('handles invalid event time', async () => {
      const event = {
        title: 'Weekly Community Quiz',
        description: 'Join us for our weekly quiz!',
        startTime: new Date('2020-01-01'), // Past date
        duration: 60
      };

      const result = await createQuizEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('invalid time');
    });
  });

  describe('createBrainTeaserEvent', () => {
    it('creates daily brain teaser event', async () => {
      const event = {
        title: 'Daily Brain Teaser',
        description: 'New brain teaser available!',
        startTime: new Date(),
        duration: 1440 // 24 hours
      };

      const result = await createBrainTeaserEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.googleEventId).toBeDefined();
    });

    it('handles event creation failure', async () => {
      const event = {
        title: 'Daily Brain Teaser',
        description: 'New brain teaser available!',
        startTime: new Date(),
        duration: 1440
      };

      const result = await createBrainTeaserEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('syncEvents', () => {
    it('syncs events with Google Calendar', async () => {
      const result = await syncEvents();

      expect(result.success).toBe(true);
      expect(result.syncedEvents).toBeGreaterThan(0);
    });

    it('handles sync conflicts', async () => {
      const result = await syncEvents();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('conflict');
    });
  });

  describe('getUpcomingEvents', () => {
    it('returns upcoming quiz events', async () => {
      const events = await getUpcomingEvents('quiz');

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(event.type).toBe('quiz');
        expect(new Date(event.startTime)).toBeInstanceOf(Date);
      });
    });

    it('returns upcoming brain teaser events', async () => {
      const events = await getUpcomingEvents('brain-teaser');

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(event.type).toBe('brain-teaser');
        expect(new Date(event.startTime)).toBeInstanceOf(Date);
      });
    });

    it('returns all upcoming events', async () => {
      const events = await getUpcomingEvents();

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBeGreaterThan(0);
      events.forEach(event => {
        expect(['quiz', 'brain-teaser']).toContain(event.type);
        expect(new Date(event.startTime)).toBeInstanceOf(Date);
      });
    });

    it('handles no upcoming events', async () => {
      const events = await getUpcomingEvents();

      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });
  });
}); 