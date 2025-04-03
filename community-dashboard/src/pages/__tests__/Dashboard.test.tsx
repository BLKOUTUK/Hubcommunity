import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the child components
jest.mock('../../components/quiz/WeeklyQuiz', () => ({
  WeeklyQuiz: () => <div>Weekly Quiz</div>
}));

jest.mock('../../components/quiz/DailyBrainTeaser', () => ({
  DailyBrainTeaser: () => <div>Daily Brain Teaser</div>
}));

jest.mock('../../components/leaderboard/Leaderboard', () => ({
  Leaderboard: () => <div>Leaderboard</div>
}));

jest.mock('../../components/rewards/Rewards', () => ({
  Rewards: () => <div>Rewards</div>
}));

jest.mock('../../components/brainbox/BrainboxOfTheMonth', () => ({
  BrainboxOfTheMonth: () => <div>Brainbox of the Month</div>
}));

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    points: 100
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard title', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Community Management Dashboard')).toBeInTheDocument();
  });

  it('renders the new members metric', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('New Members')).toBeInTheDocument();
  });

  it('renders the content pieces metric', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Content Pieces')).toBeInTheDocument();
  });

  it('renders the upcoming events metric', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
  });

  it('renders the navigation links', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('shows the automation message', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Automate your community management tasks and focus on building relationships')).toBeInTheDocument();
  });

  it('renders the weekly quiz section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Weekly Quiz')).toBeInTheDocument();
  });

  it('renders the daily brain teaser section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Daily Brain Teaser')).toBeInTheDocument();
  });

  it('renders the brainbox of the month section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Brainbox of the Month')).toBeInTheDocument();
  });

  it('renders the leaderboard section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('renders the rewards section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('shows a login prompt when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Please log in to view your dashboard')).toBeInTheDocument();
  });
});