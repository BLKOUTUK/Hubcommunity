import { 
  getCurrentLiveQuiz,
  joinLiveQuiz,
  submitLiveQuizAnswer,
  getLiveQuizLeaderboard
} from '../liveQuizService';

describe('Live Quiz Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('getCurrentLiveQuiz', () => {
    it('should return current live quiz if one is active', () => {
      const quiz = getCurrentLiveQuiz();
      expect(quiz).toBeDefined();
      expect(quiz?.status).toBe('live');
    });

    it('should return null if no quiz is currently live', () => {
      // Mock the date to a time when no quiz is live
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T10:00:00Z'));
      
      const quiz = getCurrentLiveQuiz();
      expect(quiz).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('joinLiveQuiz', () => {
    it('should allow a user to join a live quiz', () => {
      const eventId = '1';
      const userId = 'new-user';
      const name = 'New User';
      const avatarUrl = '/avatars/new-user.jpg';

      joinLiveQuiz(eventId, userId, name, avatarUrl);

      const quiz = getCurrentLiveQuiz();
      const participant = quiz?.participants.find(p => p.userId === userId);

      expect(participant).toBeDefined();
      expect(participant?.name).toBe(name);
      expect(participant?.avatarUrl).toBe(avatarUrl);
    });

    it('should not allow joining a quiz that has ended', () => {
      const eventId = 'ended-quiz';
      const userId = 'new-user';
      const name = 'New User';
      const avatarUrl = '/avatars/new-user.jpg';

      expect(() => {
        joinLiveQuiz(eventId, userId, name, avatarUrl);
      }).toThrow('Cannot join quiz at this time');
    });
  });

  describe('submitLiveQuizAnswer', () => {
    it('should award points for correct answers', async () => {
      const eventId = '1';
      const userId = '1';
      const questionId = '1';
      const answerIndex = 0; // Correct answer
      const answerTime = 5;

      const result = await submitLiveQuizAnswer(eventId, userId, questionId, answerIndex, answerTime);

      expect(result.correct).toBe(true);
      expect(result.points).toBeGreaterThan(0);
    });

    it('should not award points for incorrect answers', async () => {
      const eventId = '1';
      const userId = '1';
      const questionId = '1';
      const answerIndex = 1; // Incorrect answer
      const answerTime = 5;

      const result = await submitLiveQuizAnswer(eventId, userId, questionId, answerIndex, answerTime);

      expect(result.correct).toBe(false);
      expect(result.points).toBe(0);
    });

    it('should calculate position in leaderboard', async () => {
      const eventId = '1';
      const userId = '1';
      const questionId = '1';
      const answerIndex = 0;
      const answerTime = 5;

      const result = await submitLiveQuizAnswer(eventId, userId, questionId, answerIndex, answerTime);

      expect(result.position).toBeGreaterThan(0);
    });
  });

  describe('getLiveQuizLeaderboard', () => {
    it('should return leaderboard sorted by score', () => {
      const eventId = '1';
      const leaderboard = getLiveQuizLeaderboard(eventId);

      // Check if sorted by score (descending)
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
      }
    });

    it('should break ties by answer time', () => {
      const eventId = '1';
      const leaderboard = getLiveQuizLeaderboard(eventId);

      // Check if participants with same score are sorted by answer time
      for (let i = 0; i < leaderboard.length - 1; i++) {
        if (leaderboard[i].score === leaderboard[i + 1].score) {
          const time1 = leaderboard[i].lastAnswerTime || '';
          const time2 = leaderboard[i + 1].lastAnswerTime || '';
          expect(time1.localeCompare(time2)).toBeLessThanOrEqual(0);
        }
      }
    });
  });
}); 