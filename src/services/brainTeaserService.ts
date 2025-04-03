import { logError } from '../utils/error';

export interface BrainTeaser {
  id: string;
  question: string;
  answer: string;
  hint: string;
  points: number;
}

export interface BrainTeaserSubmission {
  correct: boolean;
  message: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  solvedCount: number;
}

export const getDailyBrainTeaser = async (): Promise<BrainTeaser> => {
  try {
    // Mock implementation
    return {
      id: '1',
      question: 'What has keys but can\'t open locks?',
      answer: 'piano',
      hint: 'It makes music',
      points: 10
    };
  } catch (error) {
    logError('Failed to get daily brain teaser', error);
    throw error;
  }
};

export const submitBrainTeaserAnswer = async (
  teaserId: string,
  answer: string
): Promise<BrainTeaserSubmission> => {
  try {
    // Mock implementation
    const teaser = await getDailyBrainTeaser();
    const isCorrect = answer.toLowerCase() === teaser.answer.toLowerCase();
    
    return {
      correct: isCorrect,
      message: isCorrect 
        ? 'Correct! You earned 10 points!' 
        : 'Incorrect. Try again tomorrow!'
    };
  } catch (error) {
    logError('Failed to submit brain teaser answer', error);
    throw error;
  }
};

export const getBrainTeaserLeaderboard = async (): Promise<Array<{
  userId: string;
  name: string;
  points: number;
}>> => {
  try {
    // Mock implementation
    return [
      { userId: '1', name: 'User 1', points: 100 },
      { userId: '2', name: 'User 2', points: 90 },
      { userId: '3', name: 'User 3', points: 80 }
    ];
  } catch (error) {
    logError('Failed to get brain teaser leaderboard', error);
    throw error;
  }
}; 