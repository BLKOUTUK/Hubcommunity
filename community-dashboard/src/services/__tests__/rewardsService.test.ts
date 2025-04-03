import { 
  getUserRewards,
  syncRewards,
  awardPoints,
  getLevelProgression,
  checkLevelUp
} from '../rewardsService';

describe('Rewards Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('getUserRewards', () => {
    it('should return user rewards for existing user', async () => {
      const userId = '1';
      const rewards = await getUserRewards(userId);

      expect(rewards).toBeDefined();
      expect(rewards.points).toBeGreaterThanOrEqual(0);
      expect(rewards.level).toBeDefined();
      expect(rewards.badges).toBeInstanceOf(Array);
      expect(rewards.activities).toBeInstanceOf(Array);
    });

    it('should create new rewards for new user', async () => {
      const userId = 'new-user';
      const rewards = await getUserRewards(userId);

      expect(rewards).toBeDefined();
      expect(rewards.points).toBe(0);
      expect(rewards.level).toBe('Newcomer');
      expect(rewards.badges).toHaveLength(0);
      expect(rewards.activities).toHaveLength(0);
    });
  });

  describe('syncRewards', () => {
    it('should sync rewards with BLKOUTHUB', async () => {
      const userId = '1';
      const result = await syncRewards(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should handle sync errors gracefully', async () => {
      const userId = 'error-user';
      const result = await syncRewards(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('awardPoints', () => {
    it('should award points for valid activity', async () => {
      const userId = '1';
      const points = 10;
      const activity = 'quiz-completion';
      const description = 'Completed weekly quiz';

      const result = await awardPoints(userId, points, activity, description);

      expect(result.success).toBe(true);
      expect(result.newTotal).toBeGreaterThanOrEqual(points);
    });

    it('should not award negative points', async () => {
      const userId = '1';
      const points = -10;
      const activity = 'invalid-activity';
      const description = 'Invalid activity';

      const result = await awardPoints(userId, points, activity, description);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getLevelProgression', () => {
    it('should return correct level progression', () => {
      const points = 150;
      const progression = getLevelProgression(points);

      expect(progression.currentLevel).toBeDefined();
      expect(progression.nextLevel).toBeDefined();
      expect(progression.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progression.progressPercentage).toBeLessThanOrEqual(100);
      expect(progression.pointsToNextLevel).toBeGreaterThanOrEqual(0);
    });

    it('should handle maximum level', () => {
      const points = 1000;
      const progression = getLevelProgression(points);

      expect(progression.currentLevel).toBe('Platinum');
      expect(progression.nextLevel).toBeNull();
      expect(progression.progressPercentage).toBe(100);
      expect(progression.pointsToNextLevel).toBe(0);
    });
  });

  describe('checkLevelUp', () => {
    it('should detect level up', async () => {
      const userId = '1';
      const points = 150;
      const result = await checkLevelUp(userId, points);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeDefined();
      expect(result.badgesAwarded).toBeInstanceOf(Array);
    });

    it('should not level up if points insufficient', async () => {
      const userId = '1';
      const points = 50;
      const result = await checkLevelUp(userId, points);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBeUndefined();
      expect(result.badgesAwarded).toHaveLength(0);
    });
  });
}); 