import { useState } from 'react';
import { 
  MessageSquareIcon, 
  BarChart3Icon, 
  CheckCircleIcon, 
  ClipboardListIcon,
  PlusIcon
} from 'lucide-react';

// Import the DashboardLayout component directly from Dashboard.tsx
import { DashboardLayout } from './Dashboard';

// Survey type
type Survey = {
  id: string;
  title: string;
  description: string;
  questions: number;
  responses: number;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  endDate?: string;
};

// Feedback type
type Feedback = {
  id: string;
  type: 'survey' | 'suggestion' | 'testimonial';
  content: string;
  author: string;
  date: string;
  status: 'new' | 'reviewed' | 'addressed';
  sentiment: 'positive' | 'neutral' | 'negative';
};

const FeedbackCollection = () => {
  const [activeTab, setActiveTab] = useState('surveys');
  
  // Sample surveys
  const surveys: Survey[] = [
    {
      id: '1',
      title: 'Community Satisfaction Survey',
      description: 'Gather feedback on overall community experience and satisfaction.',
      questions: 10,
      responses: 45,
      status: 'active',
      createdAt: '2023-05-15',
      endDate: '2023-06-15'
    },
    {
      id: '2',
      title: 'Event Feedback',
      description: 'Collect feedback on recent community events and workshops.',
      questions: 8,
      responses: 32,
      status: 'active',
      createdAt: '2023-05-20',
      endDate: '2023-06-20'
    },
    {
      id: '3',
      title: 'Content Preferences',
      description: 'Understand what types of content members find most valuable.',
      questions: 12,
      responses: 28,
      status: 'draft',
      createdAt: '2023-06-01'
    }
  ];
  
  // Sample feedback
  const feedback: Feedback[] = [
    {
      id: '1',
      type: 'suggestion',
      content: 'It would be great to have more networking events focused on specific industries.',
      author: 'Alex Johnson',
      date: '2023-06-10',
      status: 'new',
      sentiment: 'neutral'
    },
    {
      id: '2',
      type: 'testimonial',
      content: 'The mentorship program has been incredibly valuable for my professional growth!',
      author: 'Jamie Smith',
      date: '2023-06-08',
      status: 'reviewed',
      sentiment: 'positive'
    }
  ];

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'new':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'reviewed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'addressed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Function to get sentiment badge color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'neutral':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Collection</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Implement regular check-in mechanisms to gather community input
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Feedback Dashboard
            </h3>
            <div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Survey
              </button>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('surveys')}
              className={`${
                activeTab === 'surveys'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Surveys
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`${
                activeTab === 'feedback'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Direct Feedback
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`${
                activeTab === 'insights'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Insights
            </button>
          </nav>
        </div>
        
        {/* Surveys Tab */}
        {activeTab === 'surveys' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map((survey) => (
                <div 
                  key={survey.id}
                  className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                        <span className="capitalize">{survey.status}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {survey.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClipboardListIcon className="h-4 w-4 mr-2" />
                        {survey.questions} questions
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MessageSquareIcon className="h-4 w-4 mr-2" />
                        {survey.responses} responses
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {survey.status === 'draft' ? 'Edit' : 'View'}
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {survey.status === 'draft' ? 'Publish' : survey.status === 'active' ? 'Share' : 'Results'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Create new survey card */}
              <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <PlusIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Create New Survey
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Design a custom survey to gather specific feedback
                  </p>
                  <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create Survey
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Other tabs would be implemented here */}
        {activeTab !== 'surveys' && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <p>This tab is under development</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeedbackCollection;
