import { 
  getUserRewards,
  syncRewards,
  awardPoints,
  getTopContributors
} from '../heartbeatService';

describe('Heartbeat Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('getUserRewards', () => {
    it('returns user rewards for existing user', async () => {
      const userId = '1';
      const rewards = await getUserRewards(userId);

      expect(rewards).toBeDefined();
      expect(rewards.points).toBeGreaterThanOrEqual(0);
      expect(rewards.level).toBeDefined();
      expect(rewards.badges).toBeInstanceOf(Array);
      expect(rewards.activities).toBeInstanceOf(Array);
    });

    it('creates new rewards for new user', async () => {
      const userId = 'new-user';
      const rewards = await getUserRewards(userId);

      expect(rewards).toBeDefined();
      expect(rewards.points).toBe(0);
      expect(rewards.level).toBe('Newcomer');
      expect(rewards.badges).toHaveLength(0);
      expect(rewards.activities).toHaveLength(0);
    });

    it('handles API errors', async () => {
      const userId = 'error-user';
      const rewards = await getUserRewards(userId);

      expect(rewards).toBeNull();
    });
  });

  describe('syncRewards', () => {
    it('syncs rewards with Heartbeat', async () => {
      const userId = '1';
      const result = await syncRewards(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('handles sync errors', async () => {
      const userId = 'error-user';
      const result = await syncRewards(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('awardPoints', () => {
    it('awards points for valid activity', async () => {
      const userId = '1';
      const points = 10;
      const activity = 'quiz-completion';
      const description = 'Completed weekly quiz';

      const result = await awardPoints(userId, points, activity, description);

      expect(result.success).toBe(true);
      expect(result.newTotal).toBeGreaterThanOrEqual(points);
    });

    it('handles invalid point values', async () => {
      const userId = '1';
      const points = -10;
      const activity = 'invalid-activity';
      const description = 'Invalid activity';

      const result = await awardPoints(userId, points, activity, description);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getTopContributors', () => {
    it('returns top contributors for period', async () => {
      const period = 'month';
      const contributors = await getTopContributors(period);

      expect(contributors).toBeInstanceOf(Array);
      expect(contributors.length).toBeGreaterThan(0);
      contributors.forEach(contributor => {
        expect(contributor.userId).toBeDefined();
        expect(contributor.name).toBeDefined();
        expect(contributor.avatarUrl).toBeDefined();
        expect(contributor.points).toBeGreaterThanOrEqual(0);
        expect(contributor.activities).toBeGreaterThanOrEqual(0);
      });
    });

    it('returns empty array for no contributors', async () => {
      const period = 'day';
      const contributors = await getTopContributors(period);

      expect(contributors).toBeInstanceOf(Array);
      expect(contributors.length).toBe(0);
    });

    it('handles invalid period', async () => {
      const period = 'invalid';
      const contributors = await getTopContributors(period);

      expect(contributors).toBeNull();
    });
  });
}); 