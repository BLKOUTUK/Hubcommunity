import { logError } from '../utils/error';
import { awardPointsAndSync } from './rewardsService';

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface QuizSubmission {
  correct: boolean;
  points: number;
  message: string;
}

export const getWeeklyQuiz = async (): Promise<Quiz> => {
  try {
    // TODO: Implement actual API call
    return {
      id: '1',
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 'Paris',
      points: 10
    };
  } catch (error) {
    logError(error, 'getWeeklyQuiz');
    throw error;
  }
};

export const submitQuizAnswer = async (userId: string, answer: string): Promise<QuizSubmission> => {
  try {
    const quiz = await getWeeklyQuiz();
    const isCorrect = answer === quiz.correctAnswer;
    
    if (isCorrect) {
      await awardPointsAndSync(userId, quiz.points, 'quiz');
    }

    return {
      correct: isCorrect,
      points: isCorrect ? quiz.points : 0,
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer. Try again next week!'
    };
  } catch (error) {
    logError(error, 'submitQuizAnswer');
    throw error;
  }
}; 