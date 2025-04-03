import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyBrainTeaser } from '../DailyBrainTeaser';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the brain teaser service
jest.mock('../../../services/brainTeaserService', () => ({
  getDailyBrainTeaser: jest.fn(),
  submitBrainTeaserAnswer: jest.fn()
}));

describe('DailyBrainTeaser Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const mockTeaser = {
    id: '1',
    question: 'What has keys but can\'t open locks?',
    hint: 'Think about music',
    correctAnswer: 'piano',
    points: 15,
    category: 'riddles'
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getDailyBrainTeaser as jest.Mock).mockResolvedValue(mockTeaser);
    (submitBrainTeaserAnswer as jest.Mock).mockResolvedValue({
      correct: true,
      points: 15,
      answerTime: new Date().toISOString()
    });
  });

  it('renders brain teaser question', async () => {
    render(<DailyBrainTeaser />);
    
    await waitFor(() => {
      expect(screen.getByText('What has keys but can\'t open locks?')).toBeInTheDocument();
    });
  });

  it('shows hint when requested', async () => {
    render(<DailyBrainTeaser />);
    
    await waitFor(() => {
      const hintButton = screen.getByText('Show Hint');
      fireEvent.click(hintButton);
      
      expect(screen.getByText('Think about music')).toBeInTheDocument();
    });
  });

  it('submits correct answer', async () => {
    render(<DailyBrainTeaser />);
    
    await waitFor(async () => {
      const answerInput = screen.getByPlaceholderText('Enter your answer');
      fireEvent.change(answerInput, { target: { value: 'piano' } });
      
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Correct!')).toBeInTheDocument();
        expect(screen.getByText('+15 points')).toBeInTheDocument();
      });
    });
  });

  it('submits incorrect answer', async () => {
    (submitBrainTeaserAnswer as jest.Mock).mockResolvedValueOnce({
      correct: false,
      points: 0,
      answerTime: new Date().toISOString()
    });

    render(<DailyBrainTeaser />);
    
    await waitFor(async () => {
      const answerInput = screen.getByPlaceholderText('Enter your answer');
      fireEvent.change(answerInput, { target: { value: 'wrong answer' } });
      
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Incorrect. Try again!')).toBeInTheDocument();
      });
    });
  });

  it('shows error message when not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    
    render(<DailyBrainTeaser />);
    
    expect(screen.getByText('Please log in to participate in the brain teaser.')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (getDailyBrainTeaser as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<DailyBrainTeaser />);
    
    expect(screen.getByText('Loading brain teaser...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (getDailyBrainTeaser as jest.Mock).mockRejectedValue(new Error('Failed to load brain teaser'));
    
    render(<DailyBrainTeaser />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load brain teaser. Please try again later.')).toBeInTheDocument();
    });
  });
}); 