import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../hooks/useEvents';
import WeeklyQuiz from '../components/quiz/WeeklyQuiz';
import DailyBrainTeaser from '../components/quiz/DailyBrainTeaser';
import BrainboxOfTheMonth from '../components/brainbox/BrainboxOfTheMonth';
import EventIntegration from '../components/events/EventIntegration';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, loading: eventsLoading, error: eventsError } = useEvents();

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">BLKOUT Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
              <p className="text-center text-gray-500">Dashboard content will go here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 