import { logError } from '../utils/error';
import { awardPointsAndSync } from './rewardsService';

interface LiveQuizEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  host: string;
  status: 'scheduled' | 'live' | 'ended';
  participants: {
    userId: string;
    name: string;
    avatarUrl: string;
    score: number;
    lastAnswerTime: string | null;
  }[];
  currentQuestion: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
    timeLimit: number; // in seconds
    category: string;
  }[];
}

// Mock data for initial implementation
const LIVE_QUIZ_EVENTS: LiveQuizEvent[] = [
  {
    id: '1',
    title: 'Thursday Night Black British History Quiz',
    date: '2024-03-21',
    startTime: '20:00',
    duration: 60,
    host: 'Community Team',
    status: 'scheduled',
    participants: [],
    currentQuestion: 0,
    questions: [
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
        timeLimit: 30,
        category: 'History'
      },
      // Add more questions here...
    ]
  }
];

/**
 * Get upcoming live quiz events
 */
export function getUpcomingLiveQuizzes(): LiveQuizEvent[] {
  return LIVE_QUIZ_EVENTS.filter(event => 
    event.status === 'scheduled' || 
    (event.status === 'live' && new Date() < new Date(`${event.date}T${event.startTime}`))
  );
}

/**
 * Get current live quiz
 */
export function getCurrentLiveQuiz(): LiveQuizEvent | null {
  const now = new Date();
  return LIVE_QUIZ_EVENTS.find(event => {
    const startTime = new Date(`${event.date}T${event.startTime}`);
    const endTime = new Date(startTime.getTime() + event.duration * 60000);
    return event.status === 'live' && now >= startTime && now <= endTime;
  }) || null;
}

/**
 * Join a live quiz
 */
export function joinLiveQuiz(eventId: string, userId: string, name: string, avatarUrl: string): void {
  const event = LIVE_QUIZ_EVENTS.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Quiz event not found');
  }

  if (event.status !== 'scheduled' && event.status !== 'live') {
    throw new Error('Cannot join quiz at this time');
  }

  if (!event.participants.some(p => p.userId === userId)) {
    event.participants.push({
      userId,
      name,
      avatarUrl,
      score: 0,
      lastAnswerTime: null
    });
  }
}

/**
 * Submit answer for current question
 */
export async function submitLiveQuizAnswer(
  eventId: string,
  userId: string,
  questionId: string,
  answerIndex: number,
  answerTime: number // seconds taken to answer
): Promise<{ correct: boolean; points: number; position: number }> {
  try {
    const event = LIVE_QUIZ_EVENTS.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Quiz event not found');
    }

    if (event.status !== 'live') {
      throw new Error('Quiz is not currently live');
    }

    const question = event.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const participant = event.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const isCorrect = answerIndex === question.correctAnswer;
    let points = 0;

    if (isCorrect) {
      // Calculate points based on speed and accuracy
      const timeBonus = Math.max(0, question.timeLimit - answerTime);
      points = question.points + Math.floor(timeBonus / 5); // Bonus point every 5 seconds saved

      // Update participant score
      participant.score += points;
      participant.lastAnswerTime = new Date().toISOString();

      // Award points in rewards system
      await awardPointsAndSync(
        userId,
        points,
        'Live quiz correct answer',
        { eventId, questionId, timeTaken: answerTime }
      );
    }

    // Calculate current position
    const position = event.participants
      .sort((a, b) => b.score - a.score)
      .findIndex(p => p.userId === userId) + 1;

    return {
      correct: isCorrect,
      points,
      position
    };
  } catch (error) {
    logError('Failed to submit live quiz answer', { eventId, userId, questionId, answerIndex, error });
    throw error;
  }
}

/**
 * Get live quiz leaderboard
 */
export function getLiveQuizLeaderboard(eventId: string): {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
  position: number;
  lastAnswerTime: string | null;
}[] {
  const event = LIVE_QUIZ_EVENTS.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Quiz event not found');
  }

  return event.participants
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.lastAnswerTime || '').localeCompare(b.lastAnswerTime || '');
    })
    .map((p, index) => ({
      ...p,
      position: index + 1
    }));
} 