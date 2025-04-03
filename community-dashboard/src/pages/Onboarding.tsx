import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  MailIcon,
  UserPlusIcon,
  BookOpenIcon,
  UsersIcon
} from 'lucide-react';

// Import the DashboardLayout component directly from Dashboard.tsx
import { DashboardLayout } from './Dashboard';

// Template type for onboarding templates
type OnboardingTemplate = {
  id: string;
  name: string;
  description: string;
  steps: number;
  active: boolean;
};

// Member type for new members
type NewMember = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
};

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Sample onboarding templates
  const templates: OnboardingTemplate[] = [
    {
      id: '1',
      name: 'Standard Welcome',
      description: 'Basic 3-step welcome process with email, resources, and introduction',
      steps: 3,
      active: true
    },
    {
      id: '2',
      name: 'Premium Member',
      description: 'Extended onboarding for premium members with personal call',
      steps: 5,
      active: true
    },
    {
      id: '3',
      name: 'Event Speaker',
      description: 'Specialized onboarding for community speakers and presenters',
      steps: 4,
      active: false
    }
  ];
  
  // Sample new members
  const newMembers: NewMember[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      joinDate: '2023-06-01',
      status: 'completed',
      progress: 100
    },
    {
      id: '2',
      name: 'Jamie Smith',
      email: 'jamie@example.com',
      joinDate: '2023-06-05',
      status: 'in-progress',
      progress: 66
    },
    {
      id: '3',
      name: 'Taylor Williams',
      email: 'taylor@example.com',
      joinDate: '2023-06-10',
      status: 'pending',
      progress: 0
    },
    {
      id: '4',
      name: 'Morgan Brown',
      email: 'morgan@example.com',
      joinDate: '2023-06-12',
      status: 'in-progress',
      progress: 33
    }
  ];

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Automation</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Automate your new member welcome process and initial connections
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Onboarding Dashboard
            </h3>
            <div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add New Member
              </button>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('members')}
              className={`${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              New Members
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Onboarding Templates
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Analytics
            </button>
          </nav>
        </div>
        
        {/* New Members Tab */}
        {activeTab === 'members' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {newMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${member.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block">
                          {member.progress}% Complete
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          Send Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`border rounded-lg overflow-hidden ${
                    selectedTemplate === template.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                      {template.active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-2">{template.steps} steps</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={() => setSelectedTemplate(template.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add new template card */}
              <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Create New Template
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Design a custom onboarding flow for your community members
                  </p>
                  <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Completion Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            85%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <MailIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Email Open Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            72%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Avg. Onboarding Time
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            3.2 days
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Onboarding Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    [Chart visualization would go here in a real application]
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Onboarding Steps Completion
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Email</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Access</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community Introduction</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Event Attendance</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">52%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback Submission</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">43%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '43%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Onboarding Resources
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
                    <BookOpenIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Welcome Guide
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive guide for new members with community guidelines and resources.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Guide
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                    <MailIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Email Templates
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customizable email templates for different stages of the onboarding process.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    View Templates
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                    <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Connection Suggestions
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Algorithm-based member connection suggestions based on interests and background.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    View Suggestions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;