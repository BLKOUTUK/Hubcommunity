import { 
  scheduleWeeklyQuiz,
  scheduleDailyBrainTeaser,
  triggerBrainboxAward,
  getWorkflowStatus
} from '../n8nWorkflowService';

describe('n8n Workflow Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('scheduleWeeklyQuiz', () => {
    it('schedules quiz for next week', async () => {
      const result = await scheduleWeeklyQuiz();

      expect(result.success).toBe(true);
      expect(result.scheduledFor).toBeDefined();
      expect(new Date(result.scheduledFor)).toBeInstanceOf(Date);
    });

    it('handles scheduling conflicts', async () => {
      const result = await scheduleWeeklyQuiz();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('conflict');
    });
  });

  describe('scheduleDailyBrainTeaser', () => {
    it('schedules brain teaser for next day', async () => {
      const result = await scheduleDailyBrainTeaser();

      expect(result.success).toBe(true);
      expect(result.scheduledFor).toBeDefined();
      expect(new Date(result.scheduledFor)).toBeInstanceOf(Date);
    });

    it('handles invalid scheduling time', async () => {
      const result = await scheduleDailyBrainTeaser();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('invalid time');
    });
  });

  describe('triggerBrainboxAward', () => {
    it('awards brainbox for current month', async () => {
      const result = await triggerBrainboxAward();

      expect(result.success).toBe(true);
      expect(result.awardedTo).toBeDefined();
      expect(result.awardedAt).toBeDefined();
    });

    it('handles no eligible users', async () => {
      const result = await triggerBrainboxAward();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('no eligible users');
    });
  });

  describe('getWorkflowStatus', () => {
    it('returns status of all workflows', async () => {
      const status = await getWorkflowStatus();

      expect(status.weeklyQuiz).toBeDefined();
      expect(status.dailyBrainTeaser).toBeDefined();
      expect(status.brainboxAward).toBeDefined();
    });

    it('includes next run times', async () => {
      const status = await getWorkflowStatus();

      expect(status.weeklyQuiz.nextRun).toBeDefined();
      expect(status.dailyBrainTeaser.nextRun).toBeDefined();
      expect(status.brainboxAward.nextRun).toBeDefined();
    });

    it('includes last run status', async () => {
      const status = await getWorkflowStatus();

      expect(status.weeklyQuiz.lastRun).toBeDefined();
      expect(status.dailyBrainTeaser.lastRun).toBeDefined();
      expect(status.brainboxAward.lastRun).toBeDefined();
    });

    it('handles workflow errors', async () => {
      const status = await getWorkflowStatus();

      expect(status.weeklyQuiz.error).toBeDefined();
      expect(status.dailyBrainTeaser.error).toBeDefined();
      expect(status.brainboxAward.error).toBeDefined();
    });
  });
}); 