import React, { useState } from 'react';
import { DashboardLayout } from './Dashboard';
import { useContentCuration } from '../hooks/useContentCuration';
import BlackoutGaze from '../components/content/BlackoutGaze';
import WeeklyQuiz from '../components/content/WeeklyQuiz';
import { useAuth } from '../contexts/AuthContext';
import { useRewards } from '../hooks/useRewards';
import {
  CalendarIcon,
  PencilIcon,
  PlusIcon,
  ClockIcon,
  RefreshCwIcon,
  BookOpenIcon,
  EyeIcon,
  LightbulbIcon
} from 'lucide-react';

// Create simple tab components for our UI
interface TabProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabProps> = ({ children, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 text-sm font-medium leading-5 text-gray-700 dark:text-gray-300
      ${selected 
        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
  >
    {children}
  </button>
);

/**
 * ContentCuration page for managing daily inspirations and weekly quizzes
 */
const ContentCuration: React.FC = () => {
  const { user } = useAuth();
  const { awardPoints } = useRewards();
  const {
    todaysInspiration,
    currentQuiz,
    loading,
    error,
    loadTodaysInspiration,
    generateDailyInspirations,
    dailyInspirations,
    loadDailyInspirations,
    weeklyQuizzes,
    loadWeeklyQuizzes
  } = useContentCuration();

  // Tab management
  const [selectedTab, setSelectedTab] = useState(0);
  const [adminView, setAdminView] = useState(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStartDate, setGenerationStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
  );

  // Quiz completion handler
  const handleQuizComplete = async (score: number, total: number) => {
    if (user && score > 0) {
      // Award points for completing the quiz
      await awardPoints('action_quiz_completion', `Completed weekly quiz with score ${score}/${total}`);
      
      // Award bonus points for perfect score
      if (score === total) {
        await awardPoints('action_perfect_quiz', 'Achieved perfect score on weekly quiz');
      }
    }
  };

  // Handle generation of new inspirations
  const handleGenerateInspirations = async () => {
    setIsGenerating(true);
    try {
      await generateDailyInspirations(generationStartDate);
      // Refresh today's inspiration
      await loadTodaysInspiration();
    } finally {
      setIsGenerating(false);
    }
  };

  // Refresh content
  const handleRefreshContent = async () => {
    await loadTodaysInspiration();
    await loadDailyInspirations();
    await loadWeeklyQuizzes();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Curation</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage daily inspirations and weekly quizzes for the community
            </p>
          </div>
          
          {user && (user.role === 'admin' || user.role === 'editor') && (
            <div className="flex space-x-3">
              <button
                onClick={() => setAdminView(!adminView)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {adminView ? <EyeIcon className="h-5 w-5 mr-2" /> : <PencilIcon className="h-5 w-5 mr-2" />}
                {adminView ? 'View Mode' : 'Admin Mode'}
              </button>
              
              <button
                onClick={handleRefreshContent}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Content
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {adminView ? (
        <div className="space-y-8">
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex p-1 space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <TabButton 
                selected={selectedTab === 0} 
                onClick={() => setSelectedTab(0)}
              >
                <span className="flex items-center justify-center">
                  <LightbulbIcon className="h-5 w-5 mr-2" />
                  Daily Inspiration
                </span>
              </TabButton>
              
              <TabButton 
                selected={selectedTab === 1} 
                onClick={() => setSelectedTab(1)}
              >
                <span className="flex items-center justify-center">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Weekly Quiz
                </span>
              </TabButton>
            </div>
            
            {/* Daily Inspiration Admin Panel */}
            {selectedTab === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  The Blackout Gaze - Daily Inspiration Management
                </h2>
                
                <div className="space-y-6">
                  {/* Current Inspiration Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Today's Inspiration Preview
                    </h3>
                    <div className="h-96">
                      <BlackoutGaze 
                        inspiration={todaysInspiration} 
                        isLoading={loading} 
                      />
                    </div>
                  </div>
                  
                  {/* Generation Controls */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Generate Daily Inspirations
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={generationStartDate}
                          onChange={(e) => setGenerationStartDate(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
                        />
                      </div>
                      
                      <button
                        onClick={handleGenerateInspirations}
                        disabled={isGenerating}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isGenerating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCwIcon className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            Generate 30 Days
                          </>
                        )}
                      </button>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                        <p>This will generate inspirations for 30 days starting from the selected date.</p>
                        <p>Each day will feature a unique quote from "The Blackout Gaze" collection.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Existing Inspirations Table */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Scheduled Inspirations
                    </h3>
                    
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Publish Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Quote
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Author
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading inspirations...
                              </td>
                            </tr>
                          ) : dailyInspirations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No inspirations found. Generate some using the controls above.
                              </td>
                            </tr>
                          ) : (
                            dailyInspirations.slice(0, 10).map((inspiration) => (
                              <tr key={inspiration.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {new Date(inspiration.publishDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                  "{inspiration.quote}"
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {inspiration.author}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {inspiration.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {new Date(inspiration.publishDate) <= new Date() ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Published
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                      Scheduled
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                      
                      {dailyInspirations.length > 10 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing 10 of {dailyInspirations.length} inspirations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Weekly Quiz Admin Panel */}
            {selectedTab === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Weekly Quiz Management
                </h2>
                
                <div className="space-y-6">
                  {/* Current Quiz Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Current Quiz Preview
                    </h3>
                    
                    <WeeklyQuiz 
                      quiz={currentQuiz} 
                      isLoading={loading} 
                    />
                  </div>
                  
                  {/* Quiz Creation Button */}
                  <div className="flex justify-center py-6">
                    <button
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create New Quiz
                    </button>
                  </div>
                  
                  {/* Quiz History */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Quiz History
                    </h3>
                    
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Questions
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Publish Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Expiry Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading quizzes...
                              </td>
                            </tr>
                          ) : weeklyQuizzes.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No quizzes found. Create your first quiz using the button above.
                              </td>
                            </tr>
                          ) : (
                            weeklyQuizzes.map((quiz) => {
                              const today = new Date();
                              const publishDate = new Date(quiz.publishDate);
                              const expiryDate = new Date(quiz.expiryDate);
                              let status = 'scheduled';
                              
                              if (today >= publishDate && today <= expiryDate) {
                                status = 'active';
                              } else if (today > expiryDate) {
                                status = 'expired';
                              }
                              
                              return (
                                <tr key={quiz.id}>
                                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                    {quiz.title}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {quiz.questions.length} questions
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {new Date(quiz.publishDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {new Date(quiz.expiryDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {status === 'active' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Active
                                      </span>
                                    )}
                                    {status === 'scheduled' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        Scheduled
                                      </span>
                                    )}
                                    {status === 'expired' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        Expired
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* User View Mode */
        <div className="space-y-12">
          {/* Daily Inspiration */}
          <section>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <LightbulbIcon className="h-6 w-6 mr-2 text-indigo-500" />
                The Blackout Gaze
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Daily Inspiration
              </span>
            </div>
            
            <BlackoutGaze 
              inspiration={todaysInspiration} 
              isLoading={loading} 
            />
          </section>
          
          {/* Weekly Quiz */}
          <section>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-2 text-indigo-500" />
                Community Quiz
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Test Your Knowledge
              </span>
            </div>
            
            <WeeklyQuiz 
              quiz={currentQuiz} 
              isLoading={loading}
              onComplete={handleQuizComplete}
            />
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ContentCuration;
