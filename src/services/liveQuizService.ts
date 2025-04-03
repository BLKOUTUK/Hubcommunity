import { logError } from '../utils/error';
import { awardPoints } from './rewardsService';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface QuizSubmission {
  userId: string;
  answer: string;
  timestamp: Date;
}

export const getWeeklyQuiz = async (): Promise<QuizQuestion> => {
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

export const submitQuizAnswer = async (
  userId: string,
  answer: string
): Promise<{ correct: boolean; points: number }> => {
  try {
    const quiz = await getWeeklyQuiz();
    const isCorrect = answer === quiz.correctAnswer;
    
    if (isCorrect) {
      await awardPoints(userId, quiz.points, 'quiz');
    }
    
    return {
      correct: isCorrect,
      points: isCorrect ? quiz.points : 0
    };
  } catch (error) {
    logError(error, 'submitQuizAnswer');
    throw error;
  }
}; 