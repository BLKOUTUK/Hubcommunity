import { 
  updateBrainboxStats, 
  getTopPerformers, 
  getCurrentBrainbox 
} from '../brainboxService';

describe('Brainbox Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('updateBrainboxStats', () => {
    it('should create new stats for a new user', () => {
      const userId = 'new-user';
      const quizPoints = 10;
      const teaserPoints = 5;
      const correctAnswers = 3;

      updateBrainboxStats(userId, quizPoints, teaserPoints, correctAnswers);

      const stats = getTopPerformers(1).find(s => s.userId === userId);
      expect(stats).toBeDefined();
      expect(stats?.totalPoints).toBe(quizPoints + teaserPoints);
      expect(stats?.correctAnswers).toBe(correctAnswers);
    });

    it('should update existing stats for a user', () => {
      const userId = 'existing-user';
      const initialPoints = 10;
      const additionalPoints = 5;

      // Initial update
      updateBrainboxStats(userId, initialPoints, 0, 1);
      
      // Second update
      updateBrainboxStats(userId, additionalPoints, 0, 1);

      const stats = getTopPerformers(1).find(s => s.userId === userId);
      expect(stats?.totalPoints).toBe(initialPoints + additionalPoints);
    });
  });

  describe('getTopPerformers', () => {
    it('should return performers sorted by points', () => {
      const performers = getTopPerformers(3);

      // Check if sorted by total points (descending)
      for (let i = 0; i < performers.length - 1; i++) {
        expect(performers[i].totalPoints).toBeGreaterThanOrEqual(performers[i + 1].totalPoints);
      }
    });

    it('should respect the limit parameter', () => {
      const limit = 2;
      const performers = getTopPerformers(limit);

      expect(performers.length).toBeLessThanOrEqual(limit);
    });

    it('should include all required stats', () => {
      const performers = getTopPerformers(1);
      const performer = performers[0];

      expect(performer).toHaveProperty('userId');
      expect(performer).toHaveProperty('name');
      expect(performer).toHaveProperty('avatarUrl');
      expect(performer).toHaveProperty('totalPoints');
      expect(performer).toHaveProperty('quizPoints');
      expect(performer).toHaveProperty('teaserPoints');
      expect(performer).toHaveProperty('correctAnswers');
      expect(performer).toHaveProperty('lastActivity');
    });
  });

  describe('getCurrentBrainbox', () => {
    it('should return current month\'s brainbox', () => {
      const brainbox = getCurrentBrainbox();

      expect(brainbox).toBeDefined();
      expect(brainbox?.month).toBe(new Date().getMonth());
      expect(brainbox?.year).toBe(new Date().getFullYear());
    });

    it('should return null if no brainbox for current month', () => {
      // Mock the date to a month with no brainbox
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
      
      const brainbox = getCurrentBrainbox();
      expect(brainbox).toBeNull();

      jest.useRealTimers();
    });

    it('should include all required brainbox details', () => {
      const brainbox = getCurrentBrainbox();

      if (brainbox) {
        expect(brainbox).toHaveProperty('userId');
        expect(brainbox).toHaveProperty('name');
        expect(brainbox).toHaveProperty('avatarUrl');
        expect(brainbox).toHaveProperty('totalPoints');
        expect(brainbox).toHaveProperty('month');
        expect(brainbox).toHaveProperty('year');
        expect(brainbox).toHaveProperty('awardedAt');
      }
    });
  });
}); 