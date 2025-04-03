import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrainboxOfTheMonth } from '../BrainboxOfTheMonth';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the brainbox service
jest.mock('../../../services/brainboxService', () => ({
  getCurrentBrainbox: jest.fn(),
  getTopPerformers: jest.fn()
}));

describe('BrainboxOfTheMonth Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const mockBrainbox = {
    userId: '1',
    name: 'Brainbox User',
    avatarUrl: '/avatars/brainbox.jpg',
    totalPoints: 500,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    awardedAt: new Date().toISOString()
  };

  const mockTopPerformers = [
    {
      userId: '1',
      name: 'Top Performer 1',
      avatarUrl: '/avatars/top1.jpg',
      totalPoints: 450,
      quizPoints: 300,
      teaserPoints: 150,
      correctAnswers: 45,
      lastActivity: new Date().toISOString()
    },
    {
      userId: '2',
      name: 'Top Performer 2',
      avatarUrl: '/avatars/top2.jpg',
      totalPoints: 400,
      quizPoints: 250,
      teaserPoints: 150,
      correctAnswers: 40,
      lastActivity: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getCurrentBrainbox as jest.Mock).mockResolvedValue(mockBrainbox);
    (getTopPerformers as jest.Mock).mockResolvedValue(mockTopPerformers);
  });

  it('renders current brainbox details', async () => {
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('Brainbox of the Month')).toBeInTheDocument();
      expect(screen.getByText('Brainbox User')).toBeInTheDocument();
      expect(screen.getByText('500 points')).toBeInTheDocument();
    });
  });

  it('renders top performers list', async () => {
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      expect(screen.getByText('Top Performer 1')).toBeInTheDocument();
      expect(screen.getByText('Top Performer 2')).toBeInTheDocument();
      expect(screen.getByText('450 points')).toBeInTheDocument();
      expect(screen.getByText('400 points')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (getCurrentBrainbox as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (getTopPerformers as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<BrainboxOfTheMonth />);
    
    expect(screen.getByText('Loading brainbox data...')).toBeInTheDocument();
  });

  it('handles no current brainbox', async () => {
    (getCurrentBrainbox as jest.Mock).mockResolvedValue(null);
    
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('No brainbox has been awarded for this month yet.')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (getCurrentBrainbox as jest.Mock).mockRejectedValue(new Error('Failed to load brainbox data'));
    
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load brainbox data. Please try again later.')).toBeInTheDocument();
    });
  });

  it('shows user rank if in top performers', async () => {
    const userInTopPerformers = {
      ...mockUser,
      userId: '1',
      totalPoints: 450
    };
    
    (useAuth as jest.Mock).mockReturnValue({ user: userInTopPerformers });
    
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Rank: #1')).toBeInTheDocument();
    });
  });

  it('shows "Not in top 10" if user not in top performers', async () => {
    const userNotInTopPerformers = {
      ...mockUser,
      userId: '3',
      totalPoints: 100
    };
    
    (useAuth as jest.Mock).mockReturnValue({ user: userNotInTopPerformers });
    
    render(<BrainboxOfTheMonth />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Rank: Not in top 10')).toBeInTheDocument();
    });
  });
}); 