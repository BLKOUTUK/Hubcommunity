import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../pages/Dashboard';
import { useAuth } from '../../contexts/AuthContext';

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

    render(<Dashboard />);
    expect(screen.getByText('Community Dashboard')).toBeInTheDocument();
  });

  it('renders the weekly quiz section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Weekly Quiz')).toBeInTheDocument();
  });

  it('renders the daily brain teaser section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Daily Brain Teaser')).toBeInTheDocument();
  });

  it('renders the brainbox of the month section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Brainbox of the Month')).toBeInTheDocument();
  });

  it('renders the leaderboard section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('renders the rewards section', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('shows a login prompt when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null
    });

    render(<Dashboard />);
    expect(screen.getByText('Please log in to view your dashboard')).toBeInTheDocument();
  });
}); 