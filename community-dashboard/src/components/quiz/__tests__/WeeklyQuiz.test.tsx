import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeeklyQuiz } from '../WeeklyQuiz';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the quiz service
jest.mock('../../../services/quizService', () => ({
  getWeeklyQuiz: jest.fn(),
  submitQuizAnswer: jest.fn()
}));

describe('WeeklyQuiz Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  const mockQuestions = [
    {
      id: '1',
      question: 'What is the capital of Jamaica?',
      options: ['Kingston', 'Montego Bay', 'Ocho Rios', 'Negril'],
      correctAnswer: 0,
      points: 10,
      explanation: 'Kingston is the capital and largest city of Jamaica.'
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getWeeklyQuiz as jest.Mock).mockResolvedValue(mockQuestions);
    (submitQuizAnswer as jest.Mock).mockResolvedValue({
      correct: true,
      points: 10,
      explanation: 'Correct!'
    });
  });

  it('renders quiz questions', async () => {
    render(<WeeklyQuiz />);
    
    await waitFor(() => {
      expect(screen.getByText('What is the capital of Jamaica?')).toBeInTheDocument();
      expect(screen.getByText('Kingston')).toBeInTheDocument();
      expect(screen.getByText('Montego Bay')).toBeInTheDocument();
      expect(screen.getByText('Ocho Rios')).toBeInTheDocument();
      expect(screen.getByText('Negril')).toBeInTheDocument();
    });
  });

  it('handles answer selection', async () => {
    render(<WeeklyQuiz />);
    
    await waitFor(() => {
      const kingstonOption = screen.getByText('Kingston');
      fireEvent.click(kingstonOption);
      
      expect(kingstonOption).toHaveClass('selected');
    });
  });

  it('submits answer and shows result', async () => {
    render(<WeeklyQuiz />);
    
    await waitFor(async () => {
      const kingstonOption = screen.getByText('Kingston');
      fireEvent.click(kingstonOption);
      
      const submitButton = screen.getByText('Submit Answer');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Correct!')).toBeInTheDocument();
        expect(screen.getByText('+10 points')).toBeInTheDocument();
      });
    });
  });

  it('shows error message when not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    
    render(<WeeklyQuiz />);
    
    expect(screen.getByText('Please log in to participate in the quiz.')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (getWeeklyQuiz as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<WeeklyQuiz />);
    
    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (getWeeklyQuiz as jest.Mock).mockRejectedValue(new Error('Failed to load quiz'));
    
    render(<WeeklyQuiz />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load quiz. Please try again later.')).toBeInTheDocument();
    });
  });
}); 