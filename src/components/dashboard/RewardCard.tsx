import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GiftIcon, TrophyIcon, StarIcon, AwardIcon } from 'lucide-react';

interface RewardLevel {
  name: string;
  points: number;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

interface RewardCardProps {
  currentPoints: number;
  nextLevelPoints: number;
  currentLevel: string;
  nextLevel: string;
  recentActivity: {
    action: string;
    points: number;
    date: string;
  }[];
}

// Define reward levels
export const rewardLevels: RewardLevel[] = [
  {
    name: 'Bronze',
    points: 0,
    description: 'Welcome to the community!',
    benefits: ['Access to community resources', 'Participation in events'],
    icon: <StarIcon className="h-5 w-5" />,
    color: 'bg-amber-600'
  },
  {
    name: 'Silver',
    points: 100,
    description: 'Active community member',
    benefits: ['Bronze benefits', 'Early access to events', 'Special community badges'],
    icon: <StarIcon className="h-5 w-5" />,
    color: 'bg-slate-400'
  },
  {
    name: 'Gold',
    points: 300,
    description: 'Dedicated community contributor',
    benefits: ['Silver benefits', 'Exclusive networking opportunities', 'Recognition in community spotlights'],
    icon: <TrophyIcon className="h-5 w-5" />,
    color: 'bg-amber-400'
  },
  {
    name: 'Platinum',
    points: 600,
    description: 'Community leader',
    benefits: ['Gold benefits', 'Mentorship opportunities', 'Priority access to all resources'],
    icon: <AwardIcon className="h-5 w-5" />,
    color: 'bg-slate-700'
  },
  {
    name: 'Diamond',
    points: 1000,
    description: 'Community champion',
    benefits: ['Platinum benefits', 'Featured member profile', 'Invitation to exclusive leadership events'],
    icon: <AwardIcon className="h-5 w-5" />,
    color: 'bg-blue-500'
  }
];

export function RewardCard({ 
  currentPoints, 
  nextLevelPoints, 
  currentLevel, 
  nextLevel,
  recentActivity
}: RewardCardProps) {
  const progress = (currentPoints / nextLevelPoints) * 100;
  const pointsToNextLevel = nextLevelPoints - currentPoints;

  // Find current level details
  const currentLevelDetails = rewardLevels.find(level => level.name === currentLevel);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Member Rewards</CardTitle>
            <CardDescription>Track your points and unlock benefits</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <GiftIcon className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold">{currentPoints} pts</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentLevelDetails && (
                <div className={`h-8 w-8 rounded-full ${currentLevelDetails.color} text-white flex items-center justify-center`}>
                  {currentLevelDetails.icon}
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{currentLevel} Member</p>
                <p className="text-xs text-muted-foreground">
                  {pointsToNextLevel} points to {nextLevel}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-medium">
              Level {rewardLevels.findIndex(level => level.name === currentLevel) + 1}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recent Activity</h4>
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{activity.action}</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-primary">+{activity.points}</span>
                <span className="text-xs text-muted-foreground">{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}