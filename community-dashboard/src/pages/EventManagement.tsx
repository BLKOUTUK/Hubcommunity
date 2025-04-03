import { useState, useEffect } from 'react';
import { Calendar, EventList, EventFilters } from '../components/events';
import { getEvents, LowdownEvent } from '../integrations/lowdown/client';
import { logError } from '../services/errorLogging';

interface Filters {
  startDate: string;
  endDate: string;
  category: string;
  locationType: 'online' | 'in-person' | 'hybrid' | undefined;
}

export const EventManagement = () => {
  const [events, setEvents] = useState<LowdownEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    category: '',
    locationType: undefined,
  });

  // Fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedEvents = await getEvents(filters);
        setEvents(fetchedEvents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
        setError(errorMessage);
        logError('Error fetching events', { error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64">
          <EventFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Event Management</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Calendar View */}
              <div className="mb-8">
                <Calendar events={events} />
              </div>

              {/* List View */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <EventList events={events} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
