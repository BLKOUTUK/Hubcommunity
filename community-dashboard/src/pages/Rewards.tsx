import { useState, useEffect } from 'react';
import { GiftIcon, TrophyIcon, StarIcon, AwardIcon, CrownIcon } from 'lucide-react';
import { DashboardLayout } from './Dashboard';
import { getBlkoutHubRewards, getMemberOfTheMonth, getLevelProgression } from '../integrations/heartbeat/rewardsService';
import WeeklyQuiz from '../components/quiz/WeeklyQuiz';
import DailyBrainTeaser from '../components/quiz/DailyBrainTeaser';
import Leaderboard from '../components/quiz/Leaderboard';
import LiveQuiz from '../components/quiz/LiveQuiz';
import BrainboxOfTheMonth from '../components/quiz/BrainboxOfTheMonth';

const Rewards = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rewards, setRewards] = useState<any>(null);
  const [memberOfTheMonth, setMemberOfTheMonth] = useState<any>(null);
  const [levelProgression, setLevelProgression] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load user rewards
      const userRewards = await getBlkoutHubRewards('current-user-id');
      if (userRewards) {
        setRewards(userRewards);
        setLevelProgression(getLevelProgression(userRewards.points));
      }

      // Load member of the month
      const motm = await getMemberOfTheMonth();
      setMemberOfTheMonth(motm);
    };

    loadData();
  }, []);

  // Mock data for rewards
  const rewardPoints = 175;
  const nextLevelPoints = 300;
  const currentLevel = 'Silver';
  const nextLevel = 'Gold';
  const recentActivity = [
    {
      action: 'Attended community workshop',
      points: 15,
      date: '2 days ago'
    },
    {
      action: 'Shared resource in forum',
      points: 10,
      date: '5 days ago'
    },
    {
      action: 'Connected with 3 members',
      points: 15,
      date: '1 week ago'
    }
  ];

  // Calculate progress percentage
  const progressPercentage = Math.round((rewardPoints / nextLevelPoints) * 100);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Rewards</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track your points, unlock benefits, and grow your community impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rewards Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Rewards</h3>
              <div className="flex items-center gap-2">
                <GiftIcon className="h-5 w-5 text-indigo-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{rewards?.points || 0} pts</span>
              </div>
            </div>
            
            {levelProgression && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-400 text-white flex items-center justify-center">
                      <StarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{levelProgression.currentLevel} Member</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {levelProgression.pointsToNext} points to {levelProgression.nextLevel}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
                    Level {levelProgression.currentLevel === 'Bronze' ? '1' : levelProgression.currentLevel === 'Silver' ? '2' : levelProgression.currentLevel === 'Gold' ? '3' : '4'}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${levelProgression.progress}%` }}
                  ></div>
                </div>

                {/* Current Benefits */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Benefits</h4>
                  <ul className="space-y-1">
                    {levelProgression.currentBenefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <StarIcon className="h-4 w-4 text-indigo-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Level Benefits */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Next Level Benefits</h4>
                  <ul className="space-y-1">
                    {levelProgression.nextBenefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <StarIcon className="h-4 w-4 text-indigo-500 mr-2 opacity-50" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {rewards?.activities.slice(0, 3).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">{activity.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">+{activity.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Member of the Month Card */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Member of the Month</h3>
              <CrownIcon className="h-5 w-5 text-yellow-500" />
            </div>
            
            {memberOfTheMonth ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={memberOfTheMonth.avatarUrl} 
                    alt={memberOfTheMonth.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{memberOfTheMonth.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {memberOfTheMonth.points} points • {memberOfTheMonth.activities} activities
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <AwardIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {memberOfTheMonth.specialBadge.name}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {memberOfTheMonth.specialBadge.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member of the Month will be announced at the end of the month.
              </p>
            )}
          </div>
        </div>

        {/* Brainbox of the Month */}
        <div className="md:col-span-2">
          <BrainboxOfTheMonth />
        </div>

        {/* Live Quiz */}
        <div className="md:col-span-2">
          <LiveQuiz />
        </div>

        {/* Daily Brain Teaser */}
        <div className="md:col-span-2">
          <DailyBrainTeaser />
        </div>

        {/* Leaderboards */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Leaderboard type="quiz" />
          <Leaderboard type="brain-teaser" />
        </div>
      </div>

      {/* Rewards Guide */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('earning')}
              className={`${
                activeTab === 'earning'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Earning Points
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`${
                activeTab === 'levels'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Reward Levels
            </button>
            <button
              onClick={() => setActiveTab('blkouthub')}
              className={`${
                activeTab === 'blkouthub'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              BLKOUTHUB
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to the Member Rewards Program!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our rewards program is designed to recognize and celebrate your contributions and engagement within our community. 
                As you participate, share resources, attend events, and connect with others, you'll earn points that unlock 
                exclusive benefits and opportunities.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This program is our way of saying thank you for being an active and valued member of our community. 
                Your participation helps strengthen our network and creates a more vibrant, supportive space for everyone.
              </p>
            </div>
          )}
          
          {activeTab === 'earning' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">How to Earn Points</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There are many ways to earn points in our community. Here are some of the key activities 
                that will help you progress through the reward levels:
              </p>
              
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex justify-between text-sm border-b pb-2">
                  <span>Sharing a resource</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">+10 points</span>
                </li>
                <li className="flex justify-between text-sm border-b pb-2">
                  <span>Commenting on posts</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">+5 points</span>
                </li>
                <li className="flex justify-between text-sm border-b pb-2">
                  <span>Creating original content</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">+20 points</span>
                </li>
                <li className="flex justify-between text-sm border-b pb-2">
                  <span>Attending an event</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">+15 points</span>
                </li>
                <li className="flex justify-between text-sm border-b pb-2">
                  <span>Connecting with members</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">+5 points each</span>
                </li>
              </ul>
            </div>
          )}
          
          {activeTab === 'levels' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reward Levels & Benefits</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                As you earn points, you'll progress through different membership levels. 
                Each level unlocks new benefits and opportunities within our community.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-amber-600 rounded-r-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Bronze Level (0+ points)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Welcome to the community!</p>
                </div>
                <div className="p-4 border-l-4 border-slate-400 rounded-r-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Silver Level (100+ points)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active community member</p>
                </div>
                <div className="p-4 border-l-4 border-amber-400 rounded-r-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Gold Level (300+ points)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dedicated community contributor</p>
                </div>
                <div className="p-4 border-l-4 border-slate-700 rounded-r-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Platinum Level (600+ points)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Community leader</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'blkouthub' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">BLKOUTHUB Integration</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our rewards program is fully integrated with BLKOUTHUB.com, allowing you to earn and track points 
                across both platforms. Activities on either platform contribute to your overall rewards progress.
              </p>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cross-Platform Benefits</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Points earned on either platform count toward your total</li>
                  <li>Badges and achievements sync between platforms</li>
                  <li>Unified reward level across your entire community presence</li>
                  <li>Access exclusive content on both platforms based on your level</li>
                </ul>
              </div>
              
              <a 
                href="https://blkouthub.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Visit BLKOUTHUB
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
