import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  scrapeEvents,
  parseEventData,
  validateEvent,
  integrateWithCalendar
} from '../../services/eventScraperService';

interface Event {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

export const EventIntegration: React.FC = () => {
  const { user } = useAuth();
  const [sourceUrl, setSourceUrl] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScrapeEvents = async () => {
    if (!sourceUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const scrapedEvents = await scrapeEvents(sourceUrl);
      const parsedEvents = scrapedEvents.map(parseEventData);
      const validEvents = parsedEvents.filter(event => {
        const validation = validateEvent(event);
        return validation.isValid;
      });

      setEvents(validEvents);
      setSuccess(`Found ${validEvents.length} valid events`);
    } catch (err) {
      setError('Failed to scrape events');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrateWithCalendar = async (event: Event) => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await integrateWithCalendar(event);
      if (result.success) {
        setSuccess('Event integrated successfully');
      } else {
        setError('Failed to integrate event');
      }
    } catch (err) {
      setError('Failed to integrate event');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Admin access required</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Event Integration</h2>
      
      <div className="mb-4">
        <label htmlFor="sourceUrl" className="block mb-2">
          Event Source URL
        </label>
        <input
          type="url"
          id="sourceUrl"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/events"
        />
      </div>

      <button
        onClick={handleScrapeEvents}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Scraping events...' : 'Scrape Events'}
      </button>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Scraped Events</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="p-4 border rounded">
                <h4 className="font-bold">{event.title}</h4>
                <p className="text-gray-600">{event.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.startTime).toLocaleString()} -{' '}
                  {new Date(event.endTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{event.location}</p>
                <button
                  onClick={() => handleIntegrateWithCalendar(event)}
                  disabled={loading}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? 'Integrating...' : 'Integrate with Calendar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 