import { logError, logInfo } from './errorLogging';
import { awardPointsAndSync } from '../integrations/heartbeat/rewardsService';

// Quiz question interface
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
  category: string;
}

// Brain teaser interface
interface BrainTeaser {
  id: string;
  question: string;
  answer: string;
  hint: string;
  points: number;
  category: string;
  publishTime: string;
  answerTime: string;
}

// Leaderboard entry interface
interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  points: number;
  correctAnswers: number;
  lastPlayed: string;
}

// Mock data for initial implementation
const WEEKLY_QUIZ: QuizQuestion[] = [
  // History Questions
  {
    id: '1',
    question: 'What was the first Black-owned business in the UK?',
    options: [
      'The African and Caribbean Restaurant',
      'The Black Cultural Archives',
      'The Brixton Market',
      'The Notting Hill Carnival'
    ],
    correctAnswer: 0,
    points: 10,
    explanation: 'The African and Caribbean Restaurant, opened in 1948, was the first Black-owned business in the UK.',
    category: 'History'
  },
  {
    id: '2',
    question: 'Who was the first Black British MP?',
    options: [
      'Diane Abbott',
      'Paul Boateng',
      'Bernie Grant',
      'David Lammy'
    ],
    correctAnswer: 1,
    points: 10,
    explanation: 'Paul Boateng became the first Black British MP in 1987.',
    category: 'History'
  },
  // Add more questions here...
];

const BRAIN_TEASERS: BrainTeaser[] = [
  {
    id: '1',
    question: 'I am a symbol of resistance and unity. I have three colors: red, black, and green. What am I?',
    answer: 'The Pan-African flag',
    hint: 'Created in 1920',
    points: 5,
    category: 'History',
    publishTime: '08:30',
    answerTime: '20:30'
  },
  // Add more teasers here...
];

// Leaderboard data
const LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: '1',
    name: 'John Doe',
    avatarUrl: '/avatars/1.jpg',
    points: 150,
    correctAnswers: 12,
    lastPlayed: '2024-03-14T20:30:00Z'
  },
  // Add more entries here...
];

/**
 * Get the current weekly quiz
 */
export function getWeeklyQuiz(): QuizQuestion[] {
  return WEEKLY_QUIZ;
}

/**
 * Get today's brain teaser
 */
export function getDailyBrainTeaser(): BrainTeaser | null {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  
  // Find teaser for current day
  const teaser = BRAIN_TEASERS.find(t => 
    t.publishTime === currentTime && 
    !localStorage.getItem(`teaser_${t.id}_answered`)
  );
  
  return teaser || null;
}

/**
 * Get the leaderboard
 */
export function getLeaderboard(): LeaderboardEntry[] {
  return LEADERBOARD.sort((a, b) => b.points - a.points);
}

/**
 * Submit a quiz answer
 */
export async function submitQuizAnswer(
  userId: string,
  questionId: string,
  answerIndex: number
): Promise<{ correct: boolean; points: number; explanation: string }> {
  try {
    const question = WEEKLY_QUIZ.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = answerIndex === question.correctAnswer;
    
    if (isCorrect) {
      // Award points for correct answer
      await awardPointsAndSync(
        userId,
        question.points,
        'Correct quiz answer',
        { questionId, question: question.question }
      );
    }

    return {
      correct: isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation
    };
  } catch (error) {
    logError('Failed to submit quiz answer', { userId, questionId, answerIndex, error });
    throw error;
  }
}

/**
 * Submit a brain teaser answer
 */
export async function submitBrainTeaserAnswer(
  userId: string,
  teaserId: string,
  answer: string
): Promise<{ correct: boolean; points: number }> {
  try {
    const teaser = BRAIN_TEASERS.find(t => t.id === teaserId);
    if (!teaser) {
      throw new Error('Brain teaser not found');
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    if (currentTime < teaser.answerTime) {
      throw new Error('Answer time has not started yet');
    }

    const isCorrect = answer.toLowerCase() === teaser.answer.toLowerCase();
    
    if (isCorrect) {
      // Award points for correct answer
      await awardPointsAndSync(
        userId,
        teaser.points,
        'Correct brain teaser answer',
        { teaserId, question: teaser.question }
      );
      
      // Mark teaser as answered
      localStorage.setItem(`teaser_${teaserId}_answered`, 'true');
    }

    return {
      correct: isCorrect,
      points: isCorrect ? teaser.points : 0
    };
  } catch (error) {
    logError('Failed to submit brain teaser answer', { userId, teaserId, answer, error });
    throw error;
  }
} 