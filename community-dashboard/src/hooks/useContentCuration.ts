import { useState, useEffect, useCallback } from 'react';
import contentCurationService, {
  DailyInspiration,
  WeeklyQuiz
} from '../services/contentCuration';
import { logError } from '../services/errorLogging';

/**
 * Hook for content curation features
 */
export const useContentCuration = () => {
  const [dailyInspirations, setDailyInspirations] = useState<DailyInspiration[]>([]);
  const [todaysInspiration, setTodaysInspiration] = useState<DailyInspiration | null>(null);
  const [weeklyQuizzes, setWeeklyQuizzes] = useState<WeeklyQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<WeeklyQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all daily inspirations
   */
  const loadDailyInspirations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const inspirations = await contentCurationService.getDailyInspirations();
      setDailyInspirations(inspirations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load daily inspirations';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load today's inspiration
   */
  const loadTodaysInspiration = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const inspiration = await contentCurationService.getTodaysInspiration();
      setTodaysInspiration(inspiration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load today\'s inspiration';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new daily inspiration
   */
  const createDailyInspiration = useCallback(async (data: Omit<DailyInspiration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newInspiration = await contentCurationService.createDailyInspiration(data);
      setDailyInspirations(prev => [newInspiration, ...prev]);
      return newInspiration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create daily inspiration';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all weekly quizzes
   */
  const loadWeeklyQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const quizzes = await contentCurationService.getWeeklyQuizzes();
      setWeeklyQuizzes(quizzes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load weekly quizzes';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load current active quiz
   */
  const loadCurrentQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const quiz = await contentCurationService.getCurrentQuiz();
      setCurrentQuiz(quiz);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load current quiz';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new weekly quiz
   */
  const createWeeklyQuiz = useCallback(async (data: Omit<WeeklyQuiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newQuiz = await contentCurationService.createWeeklyQuiz(data);
      setWeeklyQuizzes(prev => [newQuiz, ...prev]);
      return newQuiz;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create weekly quiz';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate daily inspirations for the next 30 days
   */
  const generateDailyInspirations = useCallback(async (startDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const generatedInspirations = await contentCurationService.generateDailyInspirations(startDate);
      setDailyInspirations(prev => [...generatedInspirations, ...prev]);
      return generatedInspirations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate daily inspirations';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadTodaysInspiration();
    loadCurrentQuiz();
  }, [loadTodaysInspiration, loadCurrentQuiz]);

  return {
    dailyInspirations,
    todaysInspiration,
    weeklyQuizzes,
    currentQuiz,
    loading,
    error,
    loadDailyInspirations,
    loadTodaysInspiration,
    createDailyInspiration,
    loadWeeklyQuizzes,
    loadCurrentQuiz,
    createWeeklyQuiz,
    generateDailyInspirations
  };
};

export default useContentCuration;