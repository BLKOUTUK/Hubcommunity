import { useState, useEffect } from 'react';
import { 
  GiftIcon, 
  TrophyIcon, 
  StarIcon, 
  AwardIcon, 
  HeartIcon, 
  Users2Icon, 
  CalendarIcon,
  MessageSquareIcon,
  LinkIcon,
  RefreshCwIcon
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RewardCard, rewardLevels } from '@/components/dashboard/RewardCard';
import { RewardsGuide } from '@/components/dashboard/RewardsGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  isBlkoutHubEnabled, 
  getBlkoutHubRewards, 
  syncRewardsWithBlkoutHub,
  BlkoutHubRewards
} from '@/integrations/heartbeat';

// Mock data for the rewards page
const mockUserRewards = {
  currentPoints: 175,
  nextLevelPoints: 300,
  currentLevel: 'Silver',
  nextLevel: 'Gold',
  recentActivity: [
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
    },
    {
      action: 'Commented on community post',
      points: 5,
      date: '1 week ago'
    }
  ]
};

// Mock achievements data
const achievements = [
  {
    id: 1,
    name: 'First Connection',
    description: 'Connect with your first community member',
    icon: <Users2Icon className="h-5 w-5" />,
    points: 10,
    completed: true,
    date: 'Jan 15, 2023'
  },
  {
    id: 2,
    name: 'Resource Contributor',
    description: 'Share your first resource with the community',
    icon: <HeartIcon className="h-5 w-5" />,
    points: 15,
    completed: true,
    date: 'Feb 3, 2023'
  },
  {
    id: 3,
    name: 'Event Participant',
    description: 'Attend your first community event',
    icon: <CalendarIcon className="h-5 w-5" />,
    points: 20,
    completed: true,
    date: 'Mar 10, 2023'
  },
  {
    id: 4,
    name: 'Feedback Provider',
    description: 'Provide valuable feedback to the community',
    icon: <MessageSquareIcon className="h-5 w-5" />,
    points: 15,
    completed: false
  },
  {
    id: 5,
    name: 'Network Builder',
    description: 'Connect with 10+ community members',
    icon: <Users2Icon className="h-5 w-5" />,
    points: 30,
    completed: false
  },
  {
    id: 6,
    name: 'Content Creator',
    description: 'Create and share original content',
    icon: <HeartIcon className="h-5 w-5" />,
    points: 25,
    completed: false
  }
];

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncingWithBlkoutHub, setSyncingWithBlkoutHub] = useState(false);
  const [blkoutHubRewards, setBlkoutHubRewards] = useState<BlkoutHubRewards | null>(null);
  
  // Calculate user's level index
  const currentLevelIndex = rewardLevels.findIndex(level => level.name === mockUserRewards.currentLevel);
  
  // Check if BLKOUTHUB integration is enabled
  const blkoutHubEnabled = isBlkoutHubEnabled();

  // Fetch BLKOUTHUB rewards when component mounts
  useEffect(() => {
    if (blkoutHubEnabled && user?.id) {
      fetchBlkoutHubRewards();
    }
  }, [user?.id]);

  // Fetch rewards from BLKOUTHUB
  const fetchBlkoutHubRewards = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const rewards = await getBlkoutHubRewards(user.id);
      setBlkoutHubRewards(rewards);
    } catch (error) {
      console.error('Failed to fetch BLKOUTHUB rewards:', error);
      toast({
        title: 'Error fetching BLKOUTHUB rewards',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync rewards with BLKOUTHUB
  const syncWithBlkoutHub = async () => {
    if (!user?.id) return;
    
    setSyncingWithBlkoutHub(true);
    try {
      await syncRewardsWithBlkoutHub(
        user.id, 
        mockUserRewards.currentPoints, 
        mockUserRewards.currentLevel
      );
      
      // Refresh BLKOUTHUB rewards after sync
      await fetchBlkoutHubRewards();
      
      toast({
        title: 'Rewards synced with BLKOUTHUB',
        description: 'Your rewards have been successfully synced',
      });
    } catch (error) {
      console.error('Failed to sync rewards with BLKOUTHUB:', error);
      toast({
        title: 'Error syncing rewards',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setSyncingWithBlkoutHub(false);
    }
  };

  // Combine local and BLKOUTHUB activities for display
  const combinedActivities = () => {
    if (!blkoutHubRewards) return mockUserRewards.recentActivity;
    
    // Combine activities from both sources
    const blkoutHubActivities = blkoutHubRewards.recentActivities.map(activity => ({
      action: activity.action,
      points: activity.points,
      date: activity.date,
      source: 'BLKOUTHUB'
    }));
    
    const localActivities = mockUserRewards.recentActivity.map(activity => ({
      ...activity,
      source: 'Local'
    }));
    
    // Combine and sort by date (assuming date strings can be compared)
    return [...blkoutHubActivities, ...localActivities]
      .sort((a, b) => {
        // Simple string comparison for demo purposes
        // In production, parse dates properly
        return a.date < b.date ? 1 : -1;
      })
      .slice(0, 10); // Limit to 10 most recent
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Rewards</h1>
            <p className="text-muted-foreground">
              Track your points, unlock benefits, and grow your community impact.
            </p>
          </div>
          
          {blkoutHubEnabled && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={syncWithBlkoutHub}
              disabled={syncingWithBlkoutHub}
            >
              <RefreshCwIcon className={`h-4 w-4 ${syncingWithBlkoutHub ? 'animate-spin' : ''}`} />
              Sync with BLKOUTHUB
            </Button>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <RewardCard 
            currentPoints={blkoutHubRewards?.points || mockUserRewards.currentPoints}
            nextLevelPoints={blkoutHubRewards?.pointsToNextLevel + (blkoutHubRewards?.points || 0) || mockUserRewards.nextLevelPoints}
            currentLevel={blkoutHubRewards?.level || mockUserRewards.currentLevel}
            nextLevel={blkoutHubRewards?.nextLevel || mockUserRewards.nextLevel}
            recentActivity={blkoutHubRewards?.recentActivities.map(a => ({
              action: a.action,
              points: a.points,
              date: a.date
            })) || mockUserRewards.recentActivity}
          />
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Achievements</CardTitle>
                  <CardDescription>Milestones you've reached in the community</CardDescription>
                </div>
                <Badge className="bg-primary">{achievements.filter(a => a.completed).length}/{achievements.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      achievement.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full ${
                        achievement.completed ? 'bg-primary' : 'bg-muted-foreground/30'
                      } text-white flex items-center justify-center`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={achievement.completed ? "default" : "outline"} className="mb-1">
                        {achievement.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {achievement.completed 
                          ? achievement.date 
                          : `+${achievement.points} pts when completed`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm">View All Achievements</Button>
              </div>
            </CardContent>
            
            {blkoutHubEnabled && blkoutHubRewards?.badges && blkoutHubRewards.badges.length > 0 && (
              <>
                <Separator />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">BLKOUTHUB Badges</CardTitle>
                  </div>
                  <CardDescription>Badges earned on BLKOUTHUB.com</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {blkoutHubRewards.badges.map((badge, index) => (
                      <div key={index} className="flex flex-col items-center p-3 border rounded-lg text-center">
                        {badge.imageUrl ? (
                          <img 
                            src={badge.imageUrl} 
                            alt={badge.name} 
                            className="h-12 w-12 mb-2" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <AwardIcon className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <p className="text-sm font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.earnedAt}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
        
        <Tabs defaultValue="rewards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rewards">Rewards Program</TabsTrigger>
            <TabsTrigger value="history">Points History</TabsTrigger>
            <TabsTrigger value="leaderboard">Community Leaderboard</TabsTrigger>
            {blkoutHubEnabled && <TabsTrigger value="blkouthub">BLKOUTHUB Integration</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="rewards" className="space-y-4">
            <RewardsGuide />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>Track your points earning activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">April 2023</h3>
                    <div className="space-y-2">
                      {combinedActivities().map((activity, index) => (
                        <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span>{activity.action}</span>
                            {'source' in activity && activity.source === 'BLKOUTHUB' && (
                              <Badge variant="outline" className="text-xs">BLKOUTHUB</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                            <span className="font-medium text-primary">+{activity.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">March 2023</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm border-b pb-2">
                        <span>Hosted community discussion</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Mar 25, 2023</span>
                          <span className="font-medium text-primary">+30</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm border-b pb-2">
                        <span>Attended networking event</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Mar 18, 2023</span>
                          <span className="font-medium text-primary">+15</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm border-b pb-2">
                        <span>Shared resource in forum</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Mar 10, 2023</span>
                          <span className="font-medium text-primary">+10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Leaderboard</CardTitle>
                <CardDescription>Top contributors in our community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-400 text-white">
                        <TrophyIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Marcus Johnson</p>
                        <p className="text-xs text-muted-foreground">Gold Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">450 pts</p>
                      <p className="text-xs text-muted-foreground">Rank #1</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-400 text-white">
                        <StarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Devon Williams</p>
                        <p className="text-xs text-muted-foreground">Silver Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">325 pts</p>
                      <p className="text-xs text-muted-foreground">Rank #2</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-600 text-white">
                        <StarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Jamal Thompson</p>
                        <p className="text-xs text-muted-foreground">Bronze Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">290 pts</p>
                      <p className="text-xs text-muted-foreground">Rank #3</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-400 text-white">
                        <StarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">You</p>
                        <p className="text-xs text-muted-foreground">Silver Member</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{blkoutHubRewards?.points || mockUserRewards.currentPoints} pts</p>
                      <p className="text-xs text-muted-foreground">Rank #7</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline">View Full Leaderboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {blkoutHubEnabled && (
            <TabsContent value="blkouthub" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    <CardTitle>BLKOUTHUB Integration</CardTitle>
                  </div>
                  <CardDescription>
                    Connect your rewards and activities with BLKOUTHUB.com
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : blkoutHubRewards ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div>
                          <h3 className="font-medium">BLKOUTHUB Account</h3>
                          <p className="text-sm text-muted-foreground">Your accounts are connected</p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          Connected
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Points on BLKOUTHUB</h3>
                          <div className="text-3xl font-bold text-primary">{blkoutHubRewards.points}</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {blkoutHubRewards.level} Member • {blkoutHubRewards.pointsToNextLevel} points to {blkoutHubRewards.nextLevel}
                          </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Badges Earned</h3>
                          <div className="text-3xl font-bold text-primary">{blkoutHubRewards.badges.length}</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Most recent: {blkoutHubRewards.badges[0]?.name || 'None yet'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Recent BLKOUTHUB Activity</h3>
                        <div className="space-y-2">
                          {blkoutHubRewards.recentActivities.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                              <span>{activity.action}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{activity.date}</span>
                                <span className="font-medium text-primary">+{activity.points}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Connect to BLKOUTHUB</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Link your account to sync rewards, points, and achievements between platforms.
                      </p>
                      <Button onClick={fetchBlkoutHubRewards}>
                        Connect Account
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://blkouthub.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Visit BLKOUTHUB
                    </a>
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2"
                    onClick={syncWithBlkoutHub}
                    disabled={syncingWithBlkoutHub || !blkoutHubRewards}
                  >
                    <RefreshCwIcon className={`h-4 w-4 ${syncingWithBlkoutHub ? 'animate-spin' : ''}`} />
                    Sync Rewards
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Separator component
function Separator() {
  return <div className="h-px bg-border my-2" />;
}