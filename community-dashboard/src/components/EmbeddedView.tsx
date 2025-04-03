import React, { useState, useEffect } from 'react';
import { isBlkoutHubEnabled, getBlkoutHubRewards, BlkoutHubRewards } from '../integrations/heartbeat';
import { eventIntegration } from '../integrations/heartbeat';
import { EventbriteEvent } from '../integrations/eventbrite/client';
import { OutsavvyEvent } from '../integrations/outsavvy/client';
import { 
  CalendarIcon, 
  ExternalLinkIcon,
  AwardIcon,
  BadgeIcon
} from 'lucide-react';

/**
 * Embedded view for Notion integration
 * 
 * This component provides a simplified version of the dashboard
 * specifically designed for embedding in Notion or other platforms.
 */
const EmbeddedView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'events'>('events');
  const [blkoutHubEnabled, setBlkoutHubEnabled] = useState(false);
  const [blkoutHubRewards, setBlkoutHubRewards] = useState<BlkoutHubRewards | null>(null);
  const [events, setEvents] = useState<(EventbriteEvent | OutsavvyEvent)[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Check if BLKOUTHUB integration is enabled
      const enabled = isBlkoutHubEnabled();
      setBlkoutHubEnabled(enabled);
      
      // Fetch events
      try {
        const fetchedEvents = await eventIntegration.getAllApprovedEvents();
        setEvents(fetchedEvents);
        
        // If BLKOUTHUB is enabled, fetch rewards
        if (enabled) {
          // Using a mock user ID for demo purposes
          const rewards = await getBlkoutHubRewards('mock-user-123');
          setBlkoutHubRewards(rewards);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Get source badge color
  const getSourceBadgeColor = (source: string) => {
    return source === 'eventbrite' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  return (
    <div className="embedded-container p-4 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header with nav tabs */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">BLKOUT Community</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1 text-sm rounded-full ${
              activeTab === 'events'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            <CalendarIcon className="inline-block w-4 h-4 mr-1" />
            Events
          </button>
          
          {blkoutHubEnabled && (
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3 py-1 text-sm rounded-full ${
                activeTab === 'rewards'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              <AwardIcon className="inline-block w-4 h-4 mr-1" />
              Rewards
            </button>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2.5"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      )}
      
      {/* Events Tab */}
      {!loading && activeTab === 'events' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No upcoming events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.slice(0, 6).map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition duration-150"
                >
                  <div className="relative">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <CalendarIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                      </div>
                    )}
                    <span 
                      className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(event.source)}`}
                    >
                      {event.source}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(event.startDate).toLocaleDateString()} • {event.locationName}
                    </p>
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Event <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {events.length > 6 && (
            <div className="text-center mt-4">
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all {events.length} events
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Rewards Tab */}
      {!loading && activeTab === 'rewards' && blkoutHubEnabled && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Community Rewards</h2>
          
          {!blkoutHubRewards ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <AwardIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No rewards data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Points and Level Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Your Stats
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {blkoutHubRewards.points}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total Points
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {blkoutHubRewards.level}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Current Level
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badges Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blkoutHubRewards.badges.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No badges earned yet
                    </p>
                  ) : (
                    blkoutHubRewards.badges.slice(0, 4).map((badge: { id: string; name: string; imageUrl?: string }) => (
                      <div key={badge.id} className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          {badge.imageUrl ? (
                            <img
                              src={badge.imageUrl}
                              alt={badge.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <BadgeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-center max-w-[60px] truncate">
                          {badge.name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recent Activity
                </h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {blkoutHubRewards.activities.slice(0, 3).map((activity: { id: string; description: string; timestamp: string; points: number }) => (
                    <li key={activity.id} className="py-2">
                      <div className="flex items-center space-x-3">
                        <AwardIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                          +{activity.points} pts
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Powered by BLKOUT Community Dashboard
        </p>
      </div>
    </div>
  );
};

export default EmbeddedView;