import { 
  ActivityIcon, 
  HandshakeIcon, 
  HeartIcon, 
  MessageSquareIcon, 
  UserIcon, 
  Users2Icon 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EngagementCard } from '@/components/dashboard/EngagementCard';
import { CommunityShowcase } from '@/components/dashboard/CommunityShowcase';
import { NotificationCard } from '@/components/NotificationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CallToAction } from '@/components/CallToAction';
import { CampaignIntegration } from '@/components/CampaignIntegration';
import { Link } from 'react-router-dom';

interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  likes: number;
  comments: number;
  date: string;
}

// Example testimonial data
const testimonials: Testimonial[] = [
  {
    id: "1",
    content: "Being part of BLKOUTNXT has connected me with mentors and peers who understand my experience. The resources and support have been transformative for my personal and professional growth.",
    author: {
      name: "Marcus Johnson",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "Community Member",
    },
    likes: 24,
    comments: 5,
    date: "2 days ago",
  },
  {
    id: "2",
    content: "The network I've built through BLKOUTNXT has opened doors I didn't even know existed. Finding community with other Black queer professionals has been invaluable.",
    author: {
      name: "Devon Williams",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      role: "Network Partner",
    },
    likes: 18,
    comments: 3,
    date: "1 week ago",
  },
  {
    id: "3",
    content: "The educational resources and events have helped me navigate my career while staying true to my identity. BLKOUTNXT creates spaces where I can be my full self.",
    author: {
      name: "Jamal Thompson",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "Resource Contributor",
    },
    likes: 32,
    comments: 7,
    date: "2 weeks ago",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your community engagement.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EngagementCard
            title="Community Contributions"
            metrics="12"
            description="Shared resources and stories"
            progress={75}
            change={8}
            icon={<HeartIcon className="h-5 w-5" />}
          />
          <EngagementCard
            title="Events Attended"
            metrics="4"
            description="Community gatherings and workshops"
            progress={40}
            change={12}
            icon={<Users2Icon className="h-5 w-5" />}
          />
          <EngagementCard
            title="Network Connections"
            metrics="28"
            description="Professional and community connections"
            progress={60}
            change={16}
            icon={<HandshakeIcon className="h-5 w-5" />}
          />
          <EngagementCard
            title="Personal Growth"
            metrics="85%"
            description="Progress on your development goals"
            progress={85}
            change={5}
            icon={<UserIcon className="h-5 w-5" />}
          />
        </div>
        
        {/* Active Campaigns Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Campaigns</h2>
            <Button variant="link" asChild>
              <Link to="/campaigns" className="flex items-center gap-1">
                View all campaigns
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
          
          <CampaignIntegration variant="minimal" showTabs={false} />
        </div>
        
        <Tabs defaultValue="community">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          </TabsList>
          <TabsContent value="community" className="space-y-8">
            <CommunityShowcase 
              onFollow={(memberId) => console.log('Follow:', memberId)}
              onUnfollow={(memberId) => console.log('Unfollow:', memberId)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Your Impact</CardTitle>
                  </div>
                  <CardDescription>
                    See how your contributions are making a difference.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resources shared</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Community support</span>
                      <span className="font-medium">12 hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Network introductions</span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Event participation</span>
                      <span className="font-medium">4 events</span>
                    </div>
                  </div>
                  <Button className="w-full">View Detailed Impact</Button>
                </CardContent>
              </Card>
              
              <NotificationCard 
                notifications={[]}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
                onDismiss={() => {}}
              />
            </div>
          </TabsContent>
          <TabsContent value="resources" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="flow-card">
                <CardHeader>
                  <CardTitle>Mental Health Resources</CardTitle>
                  <CardDescription>Support for your wellbeing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Access therapists, support groups, and self-care practices designed for Black queer men.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full">Explore Resources</Button>
                </div>
              </Card>
              
              <Card className="flow-card">
                <CardHeader>
                  <CardTitle>Professional Development</CardTitle>
                  <CardDescription>Career growth and opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Find mentorship, job listings, and skill-building workshops tailored to your goals.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full">Explore Resources</Button>
                </div>
              </Card>
              
              <Card className="flow-card">
                <CardHeader>
                  <CardTitle>Community Stories</CardTitle>
                  <CardDescription>Voices and experiences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Read and share stories from community members about their journeys and insights.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full">Explore Resources</Button>
                </div>
              </Card>
            </div>
            
            <CallToAction 
              title="Share Your Knowledge"
              description="Contribute resources, articles, or tools that have helped you. Your experience could support another community member's journey."
              buttonText="Submit a Resource"
              buttonHref="/resources/submit"
            />
          </TabsContent>
          <TabsContent value="events" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="flow-card">
                <CardHeader>
                  <CardTitle>Community Gathering</CardTitle>
                  <CardDescription>June 15, 2023 • 6:00 PM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Join us for an evening of connection, conversation, and community building at our monthly gathering.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full">RSVP</Button>
                </div>
              </Card>
              
              <Card className="flow-card">
                <CardHeader>
                  <CardTitle>Professional Networking</CardTitle>
                  <CardDescription>June 22, 2023 • 7:00 PM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Connect with other professionals in your field and beyond at our networking mixer.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full">RSVP</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}