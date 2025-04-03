import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GiftIcon,
  TrophyIcon,
  StarIcon,
  AwardIcon,
  HeartIcon,
  Users2Icon,
  MessageSquareIcon,
  CalendarIcon,
  CheckCircleIcon,
  LinkIcon
} from 'lucide-react';
import { rewardLevels } from './RewardCard';

export function RewardsGuide() {
  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-primary" />
          <CardTitle>Member Rewards Program</CardTitle>
        </div>
        <CardDescription>
          Your guide to earning points and unlocking benefits in our community
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earning">Earning Points</TabsTrigger>
            <TabsTrigger value="levels">Reward Levels</TabsTrigger>
            <TabsTrigger value="blkouthub">BLKOUTHUB</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold">Welcome to the BLKOUTNXT Member Rewards Program!</h3>
              <p>
                Our rewards program is designed to recognize and celebrate your contributions and engagement within our community. 
                As you participate, share resources, attend events, and connect with others, you'll earn points that unlock 
                exclusive benefits and opportunities.
              </p>
              <p>
                This program is our way of saying thank you for being an active and valued member of our community. 
                Your participation helps strengthen our network and creates a more vibrant, supportive space for everyone.
              </p>
              
              <h4 className="font-medium mt-4">Key Benefits:</h4>
              <ul className="space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Recognition for your contributions and engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Access to exclusive resources and opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Priority access to events and networking opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Increased visibility within the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Opportunities to mentor and lead within the community</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2">
                <StarIcon className="h-4 w-4" />
                Start Earning Points
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="earning" className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold">How to Earn Points</h3>
              <p>
                There are many ways to earn points in our community. Here are some of the key activities 
                that will help you progress through the reward levels:
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-rose-500" />
                    <CardTitle className="text-base">Community Engagement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Sharing a resource</span>
                      <Badge variant="outline">+10 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Commenting on posts</span>
                      <Badge variant="outline">+5 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Creating original content</span>
                      <Badge variant="outline">+20 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Receiving likes on your content</span>
                      <Badge variant="outline">+2 points each</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Users2Icon className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Networking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Connecting with members</span>
                      <Badge variant="outline">+5 points each</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Introducing new members</span>
                      <Badge variant="outline">+15 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Mentoring other members</span>
                      <Badge variant="outline">+25 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Facilitating introductions</span>
                      <Badge variant="outline">+10 points</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-base">Events & Workshops</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Attending an event</span>
                      <Badge variant="outline">+15 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Hosting a workshop</span>
                      <Badge variant="outline">+50 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Speaking at an event</span>
                      <Badge variant="outline">+40 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Volunteering at events</span>
                      <Badge variant="outline">+30 points</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareIcon className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">Feedback & Support</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Providing feedback</span>
                      <Badge variant="outline">+10 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Answering community questions</span>
                      <Badge variant="outline">+15 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Participating in surveys</span>
                      <Badge variant="outline">+10 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Supporting new members</span>
                      <Badge variant="outline">+20 points</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium">Note:</p>
              <p>Points are awarded automatically for most activities. Some contributions may be reviewed by community moderators before points are awarded.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="levels" className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold">Reward Levels & Benefits</h3>
              <p>
                As you earn points, you'll progress through different membership levels. 
                Each level unlocks new benefits and opportunities within our community.
              </p>
            </div>
            
            <div className="space-y-4">
              {rewardLevels.map((level, index) => (
                <Card key={index} className={`border-l-4 ${level.color.replace('bg-', 'border-')}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full ${level.color} text-white flex items-center justify-center`}>
                          {level.icon}
                        </div>
                        <CardTitle className="text-base">{level.name} Level</CardTitle>
                      </div>
                      <Badge variant="outline">{level.points}+ points</Badge>
                    </div>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                    <ul className="space-y-1 text-sm">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button className="gap-2">
                <TrophyIcon className="h-4 w-4" />
                View Your Current Rewards
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="blkouthub" className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold">BLKOUTHUB Integration</h3>
              <p>
                Our rewards program is fully integrated with BLKOUTHUB.com, allowing you to earn and track points
                across both platforms. Activities on either platform contribute to your overall rewards progress.
              </p>
              
              <div className="flex items-center gap-2 mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <LinkIcon className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm font-medium">
                  Your BLKOUTHUB.com and BLKOUTNXT accounts are linked, syncing your rewards automatically.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Cross-Platform Benefits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Points earned on either platform count toward your total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Badges and achievements sync between platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Unified reward level across your entire community presence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Access exclusive content on both platforms based on your level</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">BLKOUTHUB Activities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Creating a discussion post</span>
                      <Badge variant="outline">+15 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Commenting on discussions</span>
                      <Badge variant="outline">+5 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>RSVP to community events</span>
                      <Badge variant="outline">+10 points</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Sharing resources in BLKOUTHUB</span>
                      <Badge variant="outline">+20 points</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium">How to Connect:</p>
              <p>Your accounts are automatically linked if you use the same email address. If you need to manually link your accounts, visit the BLKOUTHUB Integration tab in your Rewards dashboard.</p>
            </div>
            
            <div className="flex justify-center">
              <Button className="gap-2" asChild>
                <a href="https://blkouthub.com" target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="h-4 w-4" />
                  Visit BLKOUTHUB
                </a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}