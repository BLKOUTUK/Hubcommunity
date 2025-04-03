import React, { useState } from 'react';
import { scrapeEvents, integrateWithCalendar } from '../../services/eventScraperService';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';

const EventIntegration: React.FC = () => {
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(null);
      const scrapedEvents = await scrapeEvents(url);
      setEvents(scrapedEvents);
    } catch (err) {
      setError('Failed to scrape events. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntegrate = async () => {
    if (!events.length) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const integratedEvents = await integrateWithCalendar(events);
      
      // Add events to local state
      integratedEvents.forEach(event => {
        addEvent(event);
      });

      setSuccess(`Successfully integrated ${integratedEvents.length} events`);
      setEvents([]);
      setUrl('');
    } catch (err) {
      setError('Failed to integrate events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-integration">
      <h2>Event Integration</h2>
      
      <div className="url-input">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter event URL"
          disabled={isLoading}
        />
        <button
          onClick={handleScrape}
          disabled={!url || isLoading}
          className="scrape-button"
        >
          Scrape Events
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {events.length > 0 && (
        <div className="events-list">
          <h3>Scraped Events</h3>
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
                <small>{new Date(event.date).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
          
          <button
            onClick={handleIntegrate}
            disabled={isLoading}
            className="integrate-button"
          >
            Integrate with Calendar
          </button>
        </div>
      )}
    </div>
  );
};

export default EventIntegration; 