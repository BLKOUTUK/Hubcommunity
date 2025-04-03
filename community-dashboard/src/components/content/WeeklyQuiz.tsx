import React, { useState } from 'react';
import { WeeklyQuiz as WeeklyQuizType } from '../../services/contentCuration';

interface WeeklyQuizProps {
  quiz: WeeklyQuizType | null;
  isLoading?: boolean;
  onComplete?: (score: number, total: number) => void;
}

/**
 * Weekly Quiz component that displays and handles
 * interactive community quizzes
 */
const WeeklyQuiz: React.FC<WeeklyQuizProps> = ({
  quiz,
  isLoading = false,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-full"></div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center">
          No active quiz available
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center">
          Check back soon for our next community quiz!
        </p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    
    quiz.questions.forEach(question => {
      const selectedOptionId = selectedAnswers[question.id];
      if (selectedOptionId) {
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
        if (selectedOption?.isCorrect) {
          correct++;
        }
      }
    });
    
    return correct;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    
    if (onComplete) {
      onComplete(finalScore, totalQuestions);
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!selectedAnswers[questionId];
  };

  const allQuestionsAnswered = () => {
    return quiz.questions.every(q => isQuestionAnswered(q.id));
  };

  const getOptionClass = (questionId: string, optionId: string, isCorrect: boolean) => {
    if (!isSubmitted) {
      return selectedAnswers[questionId] === optionId
        ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900 dark:border-indigo-400'
        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
    }

    if (selectedAnswers[questionId] === optionId) {
      return isCorrect
        ? 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400'
        : 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400';
    }

    if (isCorrect) {
      return 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700';
    }

    return 'bg-white dark:bg-gray-700 opacity-60';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-indigo-600 dark:bg-indigo-800 p-6 text-white">
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <p className="mt-1 text-indigo-100">{quiz.description}</p>
        
        {!isSubmitted && (
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="ml-auto flex space-x-1">
              {quiz.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    idx === currentQuestionIndex
                      ? 'bg-white text-indigo-600'
                      : isQuestionAnswered(q.id)
                      ? 'bg-indigo-400 text-white'
                      : 'bg-indigo-800 text-indigo-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {!isSubmitted ? (
        /* Quiz Questions */
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {currentQuestion.text}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                  getOptionClass(currentQuestion.id, option.id, option.isCorrect)
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300'
              }`}
            >
              Previous
            </button>
            
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered()}
                className={`px-6 py-2 rounded-md ${
                  allQuestionsAnswered()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Results */
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              score === totalQuestions
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : score! > totalQuestions / 2
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            }`}>
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-lg ml-1">/{totalQuestions}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {score === totalQuestions
                ? 'Perfect Score!'
                : score! > totalQuestions / 2
                ? 'Great Job!'
                : 'Good Effort!'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {score === totalQuestions
                ? 'You answered all questions correctly.'
                : score! > totalQuestions / 2
                ? 'You got most of the questions right.'
                : 'Keep learning and try again next time.'}
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-lg font-medium border-b pb-2 text-gray-900 dark:text-white">
              Review Your Answers
            </h4>
            
            {quiz.questions.map((question, index) => {
              const selectedOptionId = selectedAnswers[question.id];
              const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
              const correctOption = question.options.find(opt => opt.isCorrect);
              const isCorrect = selectedOption?.isCorrect;
              
              return (
                <div key={question.id} className="border-b pb-4 last:border-0">
                  <div className="flex">
                    <span className="text-gray-600 dark:text-gray-400 mr-2">{index + 1}.</span>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{question.text}</h5>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <div className={`p-2 rounded ${
                          isCorrect
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          <p className="font-medium">
                            Your answer: {selectedOption?.text || 'No answer selected'}
                          </p>
                        </div>
                        
                        {!isCorrect && (
                          <div className="p-2 rounded bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            <p className="font-medium">
                              Correct answer: {correctOption?.text}
                            </p>
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="p-2 mt-2 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            <p className="font-medium">Explanation:</p>
                            <p>{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyQuiz;