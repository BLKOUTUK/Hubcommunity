import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Rewards } from '../Rewards';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the rewards service
jest.mock('../../../services/rewardsService', () => ({
  getUserRewards: jest.fn(),
  syncRewards: jest.fn(),
  getLevelProgression: jest.fn()
}));

describe('Rewards Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const mockRewards = {
    points: 250,
    level: 'Silver',
    badges: [
      { id: '1', name: 'Quiz Master', description: 'Completed 10 quizzes', icon: '🏆' },
      { id: '2', name: 'Brain Teaser Expert', description: 'Solved 20 brain teasers', icon: '🧠' }
    ],
    activities: [
      { id: '1', type: 'quiz', points: 10, description: 'Completed weekly quiz', timestamp: new Date().toISOString() },
      { id: '2', type: 'brain-teaser', points: 15, description: 'Solved daily brain teaser', timestamp: new Date().toISOString() }
    ]
  };

  const mockLevelProgression = {
    currentLevel: 'Silver',
    nextLevel: 'Gold',
    progressPercentage: 60,
    pointsToNextLevel: 150,
    currentLevelBenefits: ['Access to advanced quizzes', 'Priority support'],
    nextLevelBenefits: ['Exclusive content', 'Custom avatar', 'Early access to new features']
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getUserRewards as jest.Mock).mockResolvedValue(mockRewards);
    (getLevelProgression as jest.Mock).mockReturnValue(mockLevelProgression);
    (syncRewards as jest.Mock).mockResolvedValue({ success: true, message: 'Rewards synced successfully' });
  });

  it('renders user rewards', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('250 points')).toBeInTheDocument();
      expect(screen.getByText('Silver')).toBeInTheDocument();
      expect(screen.getByText('Quiz Master')).toBeInTheDocument();
      expect(screen.getByText('Brain Teaser Expert')).toBeInTheDocument();
    });
  });

  it('renders level progression', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('Level Progression')).toBeInTheDocument();
      expect(screen.getByText('Silver → Gold')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('150 points to next level')).toBeInTheDocument();
    });
  });

  it('renders current level benefits', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('Current Level Benefits')).toBeInTheDocument();
      expect(screen.getByText('Access to advanced quizzes')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
    });
  });

  it('renders next level benefits', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('Next Level Benefits')).toBeInTheDocument();
      expect(screen.getByText('Exclusive content')).toBeInTheDocument();
      expect(screen.getByText('Custom avatar')).toBeInTheDocument();
      expect(screen.getByText('Early access to new features')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (getUserRewards as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<Rewards />);
    
    expect(screen.getByText('Loading rewards...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (getUserRewards as jest.Mock).mockRejectedValue(new Error('Failed to load rewards'));
    
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load rewards. Please try again later.')).toBeInTheDocument();
    });
  });

  it('shows sync rewards button', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      expect(screen.getByText('Sync Rewards')).toBeInTheDocument();
    });
  });

  it('handles sync rewards success', async () => {
    render(<Rewards />);
    
    await waitFor(() => {
      const syncButton = screen.getByText('Sync Rewards');
      fireEvent.click(syncButton);
      
      expect(screen.getByText('Rewards synced successfully')).toBeInTheDocument();
    });
  });

  it('handles sync rewards error', async () => {
    (syncRewards as jest.Mock).mockRejectedValue(new Error('Failed to sync rewards'));
    
    render(<Rewards />);
    
    await waitFor(() => {
      const syncButton = screen.getByText('Sync Rewards');
      fireEvent.click(syncButton);
      
      expect(screen.getByText('Failed to sync rewards. Please try again later.')).toBeInTheDocument();
    });
  });
}); 