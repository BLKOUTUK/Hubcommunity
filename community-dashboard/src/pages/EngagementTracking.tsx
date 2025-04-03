qimport { useState, useEffect } from 'react';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  UsersIcon, 
  AwardIcon,
  HeartIcon,
  BadgeIcon,
  RefreshCwIcon,
  CalendarIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { isBlkoutHubEnabled, getBlkoutHubRewards, syncRewardsWithBlkoutHub, BlkoutHubRewards } from '../integrations/heartbeat';
import eventIntegration from '../integrations/heartbeat/eventIntegration';
import { EventbriteEvent } from '../integrations/eventbrite/client';
import { OutsavvyEvent } from '../integrations/outsavvy/client';

// Import the DashboardLayout component directly from Dashboard.tsx
import { DashboardLayout } from './Dashboard';

// Member type
type Member = {
  id: string;
  name: string;
  avatar?: string;
  joinDate: string;
  engagementScore: number;
  contributions: number;
  events: number;
  comments: number;
  lastActive: string;
};

const EngagementTracking = () => {
  // Auto-select the BLKOUTHUB tab if it's enabled
  const [activeTab, setActiveTab] = useState('blkouthub');
  const [timeframe, setTimeframe] = useState('month');
  const [blkoutHubEnabled, setBlkoutHubEnabled] = useState(false);
  const [blkoutHubRewards, setBlkoutHubRewards] = useState<BlkoutHubRewards | null>(null);
  const [events, setEvents] = useState<(EventbriteEvent | OutsavvyEvent)[]>([]);
  const [blkoutEvents, setBlkoutEvents] = useState<(EventbriteEvent | OutsavvyEvent)[]>([]);
  const [syncingRewards, setSyncingRewards] = useState(false);
  const [syncingEvents, setSyncingEvents] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('rewards');
  
  // Check if BLKOUTHUB integration is enabled
  useEffect(() => {
    setBlkoutHubEnabled(isBlkoutHubEnabled());
    
    // If enabled, fetch BLKOUTHUB rewards and events
    if (isBlkoutHubEnabled()) {
      fetchBlkoutHubRewards();
      fetchEvents();
    }
  }, []);
  
  // Fetch rewards from BLKOUTHUB
  const fetchBlkoutHubRewards = async () => {
    try {
      // For demo purposes, we're using a sample user ID
      const rewards = await getBlkoutHubRewards('mock-user-123');
      setBlkoutHubRewards(rewards);
    } catch (error) {
      console.error('Failed to fetch BLKOUTHUB rewards:', error);
    }
  };
  
  // Fetch events from Eventbrite and Outsavvy
  const fetchEvents = async () => {
    try {
      // Get all approved events
      const allEvents = await eventIntegration.getAllApprovedEvents();
      setEvents(allEvents);
      
      // Get BLKOUT-specific events
      const blkoutOnlyEvents = await eventIntegration.getBlkoutEvents();
      setBlkoutEvents(blkoutOnlyEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  
  // Sync events with BLKOUTHUB
  const handleEventSync = async () => {
    setSyncingEvents(true);
    try {
      await eventIntegration.syncAllEventsWithBlkoutHub();
      
      // Refetch events after sync
      await fetchEvents();
    } catch (error) {
      console.error('Failed to sync events with BLKOUTHUB:', error);
    } finally {
      setSyncingEvents(false);
    }
  };
  
  // Sync rewards with BLKOUTHUB
  const handleRewardsSync = async () => {
    setSyncingRewards(true);
    try {
      // For demo purposes, we're using sample data
      await syncRewardsWithBlkoutHub(
        'mock-user-123',
        members[0].engagementScore,
        getEngagementLevel(members[0].engagementScore)
      );
      
      // Refetch rewards after sync
      await fetchBlkoutHubRewards();
    } catch (error) {
      console.error('Failed to sync rewards with BLKOUTHUB:', error);
    } finally {
      setSyncingRewards(false);
    }
  };
  
  // Sample members
  const members: Member[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      joinDate: '2023-01-15',
      engagementScore: 92,
      contributions: 24,
      events: 8,
      comments: 47,
      lastActive: '2023-06-12'
    },
    {
      id: '2',
      name: 'Jamie Smith',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      joinDate: '2023-02-20',
      engagementScore: 87,
      contributions: 18,
      events: 6,
      comments: 32,
      lastActive: '2023-06-11'
    },
    {
      id: '3',
      name: 'Taylor Williams',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      joinDate: '2023-03-10',
      engagementScore: 78,
      contributions: 12,
      events: 5,
      comments: 28,
      lastActive: '2023-06-10'
    }
  ];

  // Function to get engagement level color
  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-500 dark:text-green-400';
    if (score >= 60) return 'text-blue-500 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Function to get engagement level label
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return 'Champion';
    if (score >= 60) return 'Active';
    if (score >= 40) return 'Engaged';
    return 'At Risk';
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Engagement Tracking</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Monitor participation and identify community champions
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              timeframe === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border-t border-b border-gray-300 dark:border-gray-600`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('quarter')}
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'quarter'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              timeframe === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Members
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      78%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                <TrendingUpIcon className="inline h-4 w-4 mr-1" />
                12% increase
              </span>
              <span className="text-gray-500 dark:text-gray-400"> from last {timeframe}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Engagement Rate
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      65%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                <TrendingUpIcon className="inline h-4 w-4 mr-1" />
                8% increase
              </span>
              <span className="text-gray-500 dark:text-gray-400"> from last {timeframe}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <BarChart3Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Content Interactions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      342
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                <TrendingUpIcon className="inline h-4 w-4 mr-1" />
                15% increase
              </span>
              <span className="text-gray-500 dark:text-gray-400"> from last {timeframe}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <AwardIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Community Champions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      12
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                <TrendingUpIcon className="inline h-4 w-4 mr-1" />
                2 new
              </span>
              <span className="text-gray-500 dark:text-gray-400"> since last {timeframe}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Engagement Dashboard
            </h3>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Member Engagement
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Content Engagement
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`${
                activeTab === 'events'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Event Participation
            </button>
            {blkoutHubEnabled && (
              <button
                onClick={() => setActiveTab('blkouthub')}
                className={`${
                  activeTab === 'blkouthub'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                BLKOUTHUB
              </button>
            )}
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Engagement overview visualization would appear here</p>
            </div>
          )}
          
          {activeTab === 'members' && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Member engagement data would appear here</p>
            </div>
          )}
          
          {activeTab === 'content' && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Content engagement metrics would appear here</p>
            </div>
          )}
          
          {activeTab === 'events' && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Event participation data would appear here</p>
            </div>
          )}
          
          {activeTab === 'blkouthub' && blkoutHubEnabled && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  BLKOUTHUB Integration
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRewardsSync}
                    disabled={syncingRewards}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncingRewards ? (
                      <>
                        <RefreshCwIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Syncing Rewards...
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="-ml-1 mr-2 h-4 w-4" />
                        Sync Rewards
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleEventSync}
                    disabled={syncingEvents}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncingEvents ? (
                      <>
                        <RefreshCwIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Syncing Events...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="-ml-1 mr-2 h-4 w-4" />
                        Sync Events
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Sub-tabs for different BLKOUTHUB sections */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Sub tabs">
                  <button
                    onClick={() => setActiveSubTab('rewards')}
                    className={`${
                      activeSubTab === 'rewards'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Rewards & Badges
                  </button>
                  <button
                    onClick={() => setActiveSubTab('events')}
                    className={`${
                      activeSubTab === 'events'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Events
                  </button>
                </nav>
              </div>
              
              {activeSubTab === 'rewards' && (
                <>
                  {blkoutHubRewards ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Rewards Summary */}
                      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Rewards Summary
                          </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Points
                              </dt>
                              <dd className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                                {blkoutHubRewards.points}
                              </dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Level
                              </dt>
                              <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                                {blkoutHubRewards.level}
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Badges Earned
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                <div className="flex flex-wrap gap-4 mt-2">
                                  {blkoutHubRewards.badges.map((badge: { id: string; name: string; imageUrl?: string }) => (
                                    <div key={badge.id} className="flex flex-col items-center space-y-1">
                                      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                        {badge.imageUrl ? (
                                          <img
                                            src={badge.imageUrl}
                                            alt={badge.name}
                                            className="w-12 h-12 rounded-full"
                                          />
                                        ) : (
                                          <BadgeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                      </div>
                                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                        {badge.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      {/* Recent Activities */}
                      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Recent BLKOUTHUB Activities
                          </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {blkoutHubRewards.activities.map((activity: { id: string; description: string; timestamp: string; points: number }) => (
                              <li key={activity.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    <AwardIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {activity.description}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(activity.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    +{activity.points} pts
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <RefreshCwIcon className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Loading BLKOUTHUB rewards data...
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {/* Events display */}
              {activeSubTab === 'events' && (
                <div className="space-y-6">
                  {/* BLKOUT Events */}
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        BLKOUT-Organized Events
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Events organized directly by BLKOUT
                      </p>
                    </div>
                    <div className="overflow-hidden overflow-x-auto">
                      {blkoutEvents.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {blkoutEvents.map((event) => (
                              <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {event.imageUrl ? (
                                      <img src={event.imageUrl} alt={event.title} className="h-10 w-10 rounded-md mr-3 object-cover" />
                                    ) : (
                                      <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                                        <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                      </div>
                                    )}
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(event.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {event.locationName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    event.source === 'eventbrite' 
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  }`}>
                                    {event.source}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <a 
                                    href={event.ticketUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  >
                                    <ExternalLinkIcon className="h-4 w-4 inline" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">No BLKOUT events found</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Community Events */}
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Community Events
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Events from the wider Black LGBTQ+ community
                      </p>
                    </div>
                    <div className="overflow-hidden overflow-x-auto">
                      {events.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {events.slice(0, 10).map((event) => (
                              <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {event.imageUrl ? (
                                      <img src={event.imageUrl} alt={event.title} className="h-10 w-10 rounded-md mr-3 object-cover" />
                                    ) : (
                                      <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                        <CalendarIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                      </div>
                                    )}
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{event.title}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(event.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {event.locationName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    event.source === 'eventbrite' 
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  }`}>
                                    {event.source}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <a 
                                    href={event.ticketUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  >
                                    <ExternalLinkIcon className="h-4 w-4 inline" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Loading community events...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EngagementTracking;
