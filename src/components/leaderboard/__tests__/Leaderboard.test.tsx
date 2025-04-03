import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from '../Leaderboard';
import { getLeaderboard } from '../../../services/leaderboardService';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the services
jest.mock('../../../services/leaderboardService');
jest.mock('../../../contexts/AuthContext');

describe('Leaderboard Component', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockLeaderboard = [
    {
      userId: '1',
      username: 'Top User',
      points: 1000,
      rank: 1,
      activities: 50
    },
    {
      userId: '2',
      username: 'Second User',
      points: 800,
      rank: 2,
      activities: 40
    },
    {
      userId: '3',
      username: 'Third User',
      points: 600,
      rank: 3,
      activities: 30
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn()
    });

    (getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);
  });

  it('should render the leaderboard title', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('should display all leaderboard entries', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      mockLeaderboard.forEach(entry => {
        expect(screen.getByText(entry.username)).toBeInTheDocument();
        expect(screen.getByText(entry.points.toString())).toBeInTheDocument();
        expect(screen.getByText(`#${entry.rank}`)).toBeInTheDocument();
      });
    });
  });

  it('should highlight the current user\'s entry', async () => {
    render(<Leaderboard />);
    await waitFor(() => {
      const userEntry = screen.getByText(mockUser.username).closest('tr');
      expect(userEntry).toHaveClass('highlight');
    });
  });

  it('should show loading state while fetching leaderboard', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('should show error message when leaderboard fetch fails', async () => {
    (getLeaderboard as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch leaderboard'));

    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load leaderboard. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should show login prompt when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn()
    });

    render(<Leaderboard />);
    expect(screen.getByText('Please log in to view the leaderboard.')).toBeInTheDocument();
  });
}); 