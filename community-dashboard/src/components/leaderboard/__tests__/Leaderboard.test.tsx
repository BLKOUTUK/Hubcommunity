import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from '../Leaderboard';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the leaderboard service
jest.mock('../../../services/leaderboardService', () => ({
  getLeaderboard: jest.fn()
}));

describe('Leaderboard Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const mockLeaderboard = [
    {
      userId: '1',
      name: 'Top User',
      avatarUrl: '/avatars/top1.jpg',
      score: 500,
      rank: 1,
      streak: 5,
      lastActivity: new Date().toISOString()
    },
    {
      userId: '2',
      name: 'Second User',
      avatarUrl: '/avatars/top2.jpg',
      score: 450,
      rank: 2,
      streak: 3,
      lastActivity: new Date().toISOString()
    },
    {
      userId: '3',
      name: 'Third User',
      avatarUrl: '/avatars/top3.jpg',
      score: 400,
      rank: 3,
      streak: 2,
      lastActivity: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);
  });

  it('renders leaderboard entries', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Top User')).toBeInTheDocument();
      expect(screen.getByText('Second User')).toBeInTheDocument();
      expect(screen.getByText('Third User')).toBeInTheDocument();
      expect(screen.getByText('500 points')).toBeInTheDocument();
      expect(screen.getByText('450 points')).toBeInTheDocument();
      expect(screen.getByText('400 points')).toBeInTheDocument();
    });
  });

  it('shows user rank if in leaderboard', async () => {
    const userInLeaderboard = {
      ...mockUser,
      userId: '1',
      score: 500
    };
    
    (useAuth as jest.Mock).mockReturnValue({ user: userInLeaderboard });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Rank: #1')).toBeInTheDocument();
    });
  });

  it('shows "Not in top 10" if user not in leaderboard', async () => {
    const userNotInLeaderboard = {
      ...mockUser,
      userId: '4',
      score: 100
    };
    
    (useAuth as jest.Mock).mockReturnValue({ user: userNotInLeaderboard });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Rank: Not in top 10')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (getLeaderboard as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<Leaderboard />);
    
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (getLeaderboard as jest.Mock).mockRejectedValue(new Error('Failed to load leaderboard'));
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load leaderboard. Please try again later.')).toBeInTheDocument();
    });
  });

  it('shows streak information', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('5 day streak')).toBeInTheDocument();
      expect(screen.getByText('3 day streak')).toBeInTheDocument();
      expect(screen.getByText('2 day streak')).toBeInTheDocument();
    });
  });

  it('shows last activity time', async () => {
    render(<Leaderboard />);
    
    await waitFor(() => {
      const lastActivityElements = screen.getAllByText(/Last activity:/);
      expect(lastActivityElements.length).toBe(3);
    });
  });

  it('highlights current user in leaderboard', async () => {
    const currentUser = {
      ...mockUser,
      userId: '1',
      score: 500
    };
    
    (useAuth as jest.Mock).mockReturnValue({ user: currentUser });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      const userEntry = screen.getByText('Top User').closest('tr');
      expect(userEntry).toHaveClass('current-user');
    });
  });
}); 