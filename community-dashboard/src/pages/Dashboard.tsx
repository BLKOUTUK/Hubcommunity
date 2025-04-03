import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3Icon,
  CalendarIcon,
  MessageSquareIcon,
  UserPlusIcon,
  FileTextIcon,
  UsersIcon,
  GiftIcon
} from 'lucide-react';

// Layout component
export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu" aria-expanded="false" aria-haspopup="true">
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm h-screen">
          <div className="px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <BarChart3Icon className="h-5 w-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <UserPlusIcon className="h-5 w-5 mr-3" />
                  Onboarding
                </Link>
              </li>
              <li>
                <Link to="/content" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FileTextIcon className="h-5 w-5 mr-3" />
                  Content
                </Link>
              </li>
              <li>
                <Link to="/events" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  Events
                </Link>
              </li>
              <li>
                <Link to="/engagement" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <UsersIcon className="h-5 w-5 mr-3" />
                  Engagement
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <MessageSquareIcon className="h-5 w-5 mr-3" />
                  Feedback
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <GiftIcon className="h-5 w-5 mr-3" />
                  Rewards
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Dashboard overview component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Management Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Automate your community management tasks and focus on building relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <UserPlusIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    New Members
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      24
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/onboarding" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Content Pieces
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
              <Link to="/content" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Upcoming Events
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      3
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/events" className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <MessageSquareIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Feedback Responses
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      18
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/feedback" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500">
                View all
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/onboarding" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Onboard New Member
            </Link>
            <Link to="/content" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <FileTextIcon className="h-5 w-5 mr-2" />
              Create Content
            </Link>
            <Link to="/events" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Schedule Event
            </Link>
            <Link to="/feedback" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <MessageSquareIcon className="h-5 w-5 mr-2" />
              Collect Feedback
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`${
                activeTab === 'onboarding'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Onboarding
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`${
                activeTab === 'content'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`${
                activeTab === 'events'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Events
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Community Overview</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your community is growing steadily. You've had 24 new members join in the last 30 days, 
                and engagement is up by 15% compared to the previous month.
              </p>
            </div>
          )}
          {activeTab === 'onboarding' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Onboarding</h3>
              <p className="text-gray-600 dark:text-gray-400">
                5 new members completed onboarding in the last 7 days. 3 members are still in the process.
              </p>
            </div>
          )}
          {activeTab === 'content' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Performance</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your latest content piece received 45 views and 12 comments. It's performing 20% better than average.
              </p>
            </div>
          )}
          {activeTab === 'events' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have 3 upcoming events in the next 14 days with a total of 28 RSVPs so far.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;