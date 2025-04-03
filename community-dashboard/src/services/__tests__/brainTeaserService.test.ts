import { 
  getDailyBrainTeaser,
  submitBrainTeaserAnswer,
  getBrainTeaserLeaderboard
} from '../brainTeaserService';

describe('Brain Teaser Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('getDailyBrainTeaser', () => {
    it('should return a new brain teaser each day', () => {
      const teaser1 = getDailyBrainTeaser();
      const teaser2 = getDailyBrainTeaser();

      expect(teaser1).toBeDefined();
      expect(teaser2).toBeDefined();
      expect(teaser1.id).toBe(teaser2.id); // Same day, same teaser
    });

    it('should return a different teaser on a different day', () => {
      const teaser1 = getDailyBrainTeaser();
      
      // Mock the date to next day
      jest.useFakeTimers().setSystemTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
      const teaser2 = getDailyBrainTeaser();
      jest.useRealTimers();

      expect(teaser1.id).not.toBe(teaser2.id);
    });
  });

  describe('submitBrainTeaserAnswer', () => {
    it('should award points for correct answers', async () => {
      const teaser = getDailyBrainTeaser();
      const userId = '1';
      const answer = teaser.correctAnswer;

      const result = await submitBrainTeaserAnswer(teaser.id, userId, answer);

      expect(result.correct).toBe(true);
      expect(result.points).toBeGreaterThan(0);
    });

    it('should not award points for incorrect answers', async () => {
      const teaser = getDailyBrainTeaser();
      const userId = '1';
      const answer = 'incorrect answer';

      const result = await submitBrainTeaserAnswer(teaser.id, userId, answer);

      expect(result.correct).toBe(false);
      expect(result.points).toBe(0);
    });

    it('should track answer time for leaderboard', async () => {
      const teaser = getDailyBrainTeaser();
      const userId = '1';
      const answer = teaser.correctAnswer;

      const result = await submitBrainTeaserAnswer(teaser.id, userId, answer);

      expect(result.answerTime).toBeDefined();
      expect(result.answerTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('getBrainTeaserLeaderboard', () => {
    it('should return leaderboard sorted by score', () => {
      const leaderboard = getBrainTeaserLeaderboard();

      // Check if sorted by score (descending)
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
      }
    });

    it('should include streak information', () => {
      const leaderboard = getBrainTeaserLeaderboard();

      leaderboard.forEach(entry => {
        expect(entry.streak).toBeDefined();
        expect(entry.streak).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include last answer time', () => {
      const leaderboard = getBrainTeaserLeaderboard();

      leaderboard.forEach(entry => {
        expect(entry.lastAnswerTime).toBeDefined();
        expect(new Date(entry.lastAnswerTime)).toBeInstanceOf(Date);
      });
    });
  });
}); 