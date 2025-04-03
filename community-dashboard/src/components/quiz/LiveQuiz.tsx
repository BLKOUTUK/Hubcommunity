import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getCurrentLiveQuiz, 
  joinLiveQuiz, 
  submitLiveQuizAnswer,
  getLiveQuizLeaderboard
} from '../../services/liveQuizService';
import { ClockIcon, TrophyIcon, UsersIcon } from 'lucide-react';

const LiveQuiz = () => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Load current quiz
  useEffect(() => {
    const loadQuiz = () => {
      const currentQuiz = getCurrentLiveQuiz();
      if (currentQuiz) {
        setQuiz(currentQuiz);
        if (user) {
          joinLiveQuiz(currentQuiz.id, user.id, user.name, user.avatarUrl);
        }
      }
    };

    loadQuiz();
    const interval = setInterval(loadQuiz, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Update leaderboard
  useEffect(() => {
    if (quiz) {
      const updateLeaderboard = () => {
        const currentLeaderboard = getLiveQuizLeaderboard(quiz.id);
        setLeaderboard(currentLeaderboard);
      };

      updateLeaderboard();
      const interval = setInterval(updateLeaderboard, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [quiz]);

  // Handle question timer
  useEffect(() => {
    if (quiz && quiz.currentQuestion >= 0) {
      const question = quiz.questions[quiz.currentQuestion];
      if (question) {
        setTimeLeft(question.timeLimit);
        setStartTime(Date.now());
        setAnswerSubmitted(false);
        setSelectedAnswer(null);

        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 0) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [quiz?.currentQuestion]);

  const handleAnswerSelect = useCallback((index: number) => {
    if (!answerSubmitted && timeLeft > 0) {
      setSelectedAnswer(index);
    }
  }, [answerSubmitted, timeLeft]);

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedAnswer === null || !quiz || !user) return;

    const answerTime = (Date.now() - startTime) / 1000; // Convert to seconds
    try {
      const result = await submitLiveQuizAnswer(
        quiz.id,
        user.id,
        quiz.questions[quiz.currentQuestion].id,
        selectedAnswer,
        answerTime
      );

      setAnswerSubmitted(true);
      // Show feedback to user
      console.log(`Answer ${result.correct ? 'correct' : 'incorrect'}! Points: ${result.points}`);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }, [selectedAnswer, quiz, user, startTime]);

  if (!quiz) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No live quiz is currently running. Check back later!
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentQuestion];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hosted by {quiz.host}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <UsersIcon className="h-5 w-5 mr-2" />
            <span>{quiz.participants.length} participants</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Question Section */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Question {quiz.currentQuestion + 1} of {quiz.questions.length}
            </h3>
            <p className="text-gray-900 dark:text-white mb-6">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answerSubmitted || timeLeft === 0}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedAnswer === index
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {!answerSubmitted && timeLeft > 0 && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Leaderboard</h3>
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQuiz; 