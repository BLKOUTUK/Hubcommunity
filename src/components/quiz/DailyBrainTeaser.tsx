import React, { useState, useEffect } from 'react';
import { getDailyBrainTeaser, submitBrainTeaserAnswer } from '../../services/brainTeaserService';
import { useAuth } from '../../contexts/AuthContext';
import { useRewards } from '../../contexts/RewardsContext';
import { BrainTeaser } from '../../services/brainTeaserService';

const DailyBrainTeaser: React.FC = () => {
  const { user } = useAuth();
  const { syncPoints } = useRewards();
  const [brainTeaser, setBrainTeaser] = useState<BrainTeaser | null>(null);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrainTeaser = async () => {
      try {
        setIsLoading(true);
        const dailyTeaser = await getDailyBrainTeaser();
        setBrainTeaser(dailyTeaser);
      } catch (err) {
        setError('Failed to load brain teaser. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrainTeaser();
  }, []);

  const handleGetHint = () => {
    if (brainTeaser?.hint) {
      setHint(brainTeaser.hint);
    }
  };

  const handleSubmit = async () => {
    if (!brainTeaser || !answer) return;

    try {
      setIsLoading(true);
      const result = await submitBrainTeaserAnswer(brainTeaser.id, answer);
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
    return <div>Loading brain teaser...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!brainTeaser) {
    return <div>No brain teaser available today.</div>;
  }

  return (
    <div className="daily-brain-teaser">
      <h2>Daily Brain Teaser</h2>
      <div className="teaser-question">{brainTeaser.question}</div>
      
      {hint && (
        <div className="teaser-hint">
          <strong>Hint:</strong> {hint}
        </div>
      )}

      <div className="answer-input">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          disabled={isLoading}
        />
      </div>

      <div className="button-group">
        <button
          onClick={handleGetHint}
          disabled={!!hint || isLoading}
          className="hint-button"
        >
          Get Hint
        </button>

        <button
          onClick={handleSubmit}
          disabled={!answer || isLoading}
          className="submit-button"
        >
          Submit Answer
        </button>
      </div>

      {submissionResult && (
        <div className={`submission-result ${submissionResult.correct ? 'correct' : 'incorrect'}`}>
          {submissionResult.message}
        </div>
      )}
    </div>
  );
};

export default DailyBrainTeaser; 