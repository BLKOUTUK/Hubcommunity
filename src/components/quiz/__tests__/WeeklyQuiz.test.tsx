import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeeklyQuiz } from '../WeeklyQuiz';
import { useAuth } from '../../../contexts/AuthContext';
import { getWeeklyQuiz, submitQuizAnswer } from '../../../services/quizService';

// Mock the auth context
jest.mock('../../../contexts/AuthContext');

// Mock the quiz service
jest.mock('../../../services/quizService', () => ({
  getWeeklyQuiz: jest.fn(),
  submitQuizAnswer: jest.fn()
}));

describe('WeeklyQuiz Component', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockQuestions = {
    id: '1',
    question: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 'Paris',
    points: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getWeeklyQuiz as jest.Mock).mockResolvedValue(mockQuestions);
    (submitQuizAnswer as jest.Mock).mockResolvedValue({
      correct: true,
      points: 10,
      message: 'Correct answer!'
    });
  });

  it('renders quiz questions', async () => {
    render(<WeeklyQuiz />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions.question)).toBeInTheDocument();
    });

    mockQuestions.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('handles answer selection', async () => {
    render(<WeeklyQuiz />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions.question)).toBeInTheDocument();
    });

    const answer = screen.getByText('Paris');
    fireEvent.click(answer);

    expect(answer).toHaveClass('selected');
  });

  it('submits answer and shows result', async () => {
    render(<WeeklyQuiz />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions.question)).toBeInTheDocument();
    });

    const answer = screen.getByText('Paris');
    fireEvent.click(answer);

    const submitButton = screen.getByText('Submit Answer');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Correct answer!')).toBeInTheDocument();
      expect(screen.getByText('Points earned: 10')).toBeInTheDocument();
    });
  });

  it('shows error message when not logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<WeeklyQuiz />);

    expect(screen.getByText('Please log in to participate in the quiz.')).toBeInTheDocument();
  });

  it('handles loading state', async () => {
    (getWeeklyQuiz as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<WeeklyQuiz />);

    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    const error = new Error('Failed to fetch quiz');
    (getWeeklyQuiz as jest.Mock).mockRejectedValue(error);

    render(<WeeklyQuiz />);

    await waitFor(() => {
      expect(screen.getByText('Error loading quiz. Please try again later.')).toBeInTheDocument();
    });
  });
}); 