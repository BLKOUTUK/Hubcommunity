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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <p>Your learning journey starts here.</p>
      </header>

      <div className="dashboard-grid">
        <section className="quiz-section">
          <WeeklyQuiz />
          <DailyBrainTeaser />
        </section>

        <section className="events-section">
          <h2>Upcoming Events</h2>
          {eventsLoading ? (
            <div>Loading events...</div>
          ) : eventsError ? (
            <div className="error-message">{eventsError}</div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <small>{new Date(event.date).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
          <EventIntegration />
        </section>

        <section className="leaderboard-section">
          <BrainboxOfTheMonth />
        </section>
      </div>
    </div>
  );
};

export default Dashboard; 