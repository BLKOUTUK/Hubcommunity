import { useState } from 'react';
import { getWeeklyQuiz, submitQuizAnswer } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';

const WeeklyQuiz = () => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; points: number; explanation: string } | null>(null);

  const questions = getWeeklyQuiz();
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !user) return;

    try {
      const result = await submitQuizAnswer(user.id, currentQuestion.id, selectedAnswer);
      setResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setResult(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Pub Quiz</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-3 text-left rounded-lg border ${
                selectedAnswer === index
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <span className="text-gray-900 dark:text-white">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {showResult && result && (
        <div className={`mb-6 p-4 rounded-lg ${
          result.correct 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className="text-sm text-gray-900 dark:text-white mb-2">
            {result.correct ? 'Correct!' : 'Incorrect!'} {result.points} points earned.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {result.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null || showResult}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>

        {showResult && currentQuestionIndex < questions.length - 1 && (
          <button
            onClick={handleNextQuestion}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};

export default WeeklyQuiz; 