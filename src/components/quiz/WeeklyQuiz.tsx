import React, { useState, useEffect } from 'react';
import { getWeeklyQuiz, submitQuizAnswer } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { useRewards } from '../../contexts/RewardsContext';
import { Quiz } from '../../services/quizService';

const WeeklyQuiz: React.FC = () => {
  const { user } = useAuth();
  const { syncPoints } = useRewards();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        const weeklyQuiz = await getWeeklyQuiz();
        setQuiz(weeklyQuiz);
      } catch (err) {
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleSubmit = async () => {
    if (!quiz || !selectedAnswer) return;

    try {
      setIsLoading(true);
      const result = await submitQuizAnswer(quiz.id, selectedAnswer);
      setSubmissionResult(result);
      
      if (result.correct) {
        await syncPoints();
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading quiz...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!quiz) {
    return <div>No quiz available at the moment.</div>;
  }

  return (
    <div className="weekly-quiz">
      <h2>Weekly Quiz</h2>
      <div className="quiz-question">{quiz.question}</div>
      
      <div className="quiz-options">
        {quiz.options.map((option, index) => (
          <label key={index} className="quiz-option">
            <input
              type="radio"
              name="quiz-answer"
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => setSelectedAnswer(e.target.value)}
            />
            {option}
          </label>
        ))}
      </div>

      {submissionResult && (
        <div className={`submission-result ${submissionResult.correct ? 'correct' : 'incorrect'}`}>
          {submissionResult.message}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedAnswer || isLoading}
        className="submit-button"
      >
        Submit Answer
      </button>
    </div>
  );
};

export default WeeklyQuiz; 