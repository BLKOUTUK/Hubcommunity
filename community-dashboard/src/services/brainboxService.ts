import { logError } from '../utils/error';
import { awardPointsAndSync } from './rewardsService';

interface BrainboxStats {
  userId: string;
  name: string;
  avatarUrl: string;
  totalPoints: number;
  correctAnswers: number;
  averageTime: number;
  quizParticipation: number;
  brainTeaserParticipation: number;
  lastUpdated: string;
}

interface BrainboxAward {
  userId: string;
  name: string;
  avatarUrl: string;
  month: string;
  year: number;
  stats: BrainboxStats;
  specialBadge: {
    name: string;
    description: string;
    icon: string;
  };
}

// Mock data for initial implementation
const BRAINBOX_STATS: BrainboxStats[] = [
  {
    userId: '1',
    name: 'John Doe',
    avatarUrl: '/avatars/1.jpg',
    totalPoints: 450,
    correctAnswers: 45,
    averageTime: 12.5,
    quizParticipation: 4,
    brainTeaserParticipation: 20,
    lastUpdated: new Date().toISOString()
  }
];

const BRAINBOX_AWARDS: BrainboxAward[] = [
  {
    userId: '1',
    name: 'John Doe',
    avatarUrl: '/avatars/1.jpg',
    month: 'March',
    year: 2024,
    stats: BRAINBOX_STATS[0],
    specialBadge: {
      name: 'Brainbox of the Month',
      description: 'Top quiz performer for March 2024',
      icon: 'brain'
    }
  }
];

/**
 * Update user's brainbox stats
 */
export async function updateBrainboxStats(
  userId: string,
  points: number,
  isCorrect: boolean,
  timeTaken: number,
  type: 'quiz' | 'brain-teaser'
): Promise<void> {
  try {
    let stats = BRAINBOX_STATS.find(s => s.userId === userId);
    
    if (!stats) {
      stats = {
        userId,
        name: '', // Will be updated from user profile
        avatarUrl: '',
        totalPoints: 0,
        correctAnswers: 0,
        averageTime: 0,
        quizParticipation: 0,
        brainTeaserParticipation: 0,
        lastUpdated: new Date().toISOString()
      };
      BRAINBOX_STATS.push(stats);
    }

    // Update stats
    stats.totalPoints += points;
    if (isCorrect) {
      stats.correctAnswers++;
      stats.averageTime = (stats.averageTime * (stats.correctAnswers - 1) + timeTaken) / stats.correctAnswers;
    }
    
    if (type === 'quiz') {
      stats.quizParticipation++;
    } else {
      stats.brainTeaserParticipation++;
    }
    
    stats.lastUpdated = new Date().toISOString();

    // Check if user qualifies for Brainbox of the Month
    await checkBrainboxAward(userId, stats);
  } catch (error) {
    logError('Failed to update brainbox stats', { userId, points, isCorrect, timeTaken, type, error });
    throw error;
  }
}

/**
 * Get current month's top performers
 */
export function getTopPerformers(limit: number = 10): BrainboxStats[] {
  return BRAINBOX_STATS
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/**
 * Get current Brainbox of the Month
 */
export function getCurrentBrainbox(): BrainboxAward | null {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return BRAINBOX_AWARDS.find(
    award => award.month === currentMonth && award.year === currentYear
  ) || null;
}

/**
 * Check and award Brainbox of the Month
 */
async function checkBrainboxAward(userId: string, stats: BrainboxStats): Promise<void> {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Check if award already exists for current month
  const existingAward = BRAINBOX_AWARDS.find(
    award => award.month === currentMonth && award.year === currentYear
  );

  if (!existingAward) {
    // Find top performer for the month
    const topPerformer = BRAINBOX_STATS
      .sort((a, b) => b.totalPoints - a.totalPoints)
      [0];

    if (topPerformer && topPerformer.userId === userId) {
      // Create new award
      const newAward: BrainboxAward = {
        userId: topPerformer.userId,
        name: topPerformer.name,
        avatarUrl: topPerformer.avatarUrl,
        month: currentMonth,
        year: currentYear,
        stats: topPerformer,
        specialBadge: {
          name: 'Brainbox of the Month',
          description: `Top quiz performer for ${currentMonth} ${currentYear}`,
          icon: 'brain'
        }
      };

      BRAINBOX_AWARDS.push(newAward);

      // Award special badge and points
      await awardPointsAndSync(
        userId,
        100, // Bonus points for winning
        'Brainbox of the Month Award',
        { month: currentMonth, year: currentYear }
      );
    }
  }
} 