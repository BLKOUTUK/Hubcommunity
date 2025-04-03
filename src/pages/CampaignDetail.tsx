import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  CheckIcon, 
  ClockIcon, 
  HeartIcon, 
  ShareIcon, 
  UsersIcon 
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CampaignIntegration } from '@/components/CampaignIntegration';

interface CampaignUpdate {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
}

interface CampaignEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  virtual: boolean;
}

interface CampaignResource {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
}

interface CampaignSupporter {
  id: number;
  name: string;
  avatar: string;
  date: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  coverImage: string;
  category: string;
  progress: number;
  goal: number;
  participants: number;
  startDate: string;
  endDate: string;
  organizer: {
    name: string;
    role: string;
    avatar: string;
  };
  updates: CampaignUpdate[];
  events: CampaignEvent[];
  resources: CampaignResource[];
  supporters: CampaignSupporter[];
}

interface CampaignData {
  [key: string]: Campaign;
}

// Mock campaign data - in a real app, this would come from an API
const campaignData: CampaignData = {
  'community-support': {
    id: 'community-support',
    title: 'Community Support Initiative',
    description: 'Join our efforts to create safe spaces and support systems for Black queer men.',
    longDescription: `
      <p>The Community Support Initiative is designed to create and strengthen safe spaces and support systems specifically for Black queer men. This campaign focuses on building a network of resources, mentorship opportunities, and community gatherings that address the unique challenges and experiences of our community.</p>
      
      <p>Through this initiative, we aim to:</p>
      <ul>
        <li>Establish regular community gatherings in key cities</li>
        <li>Develop a peer support network for mental health and wellbeing</li>
        <li>Create resources specifically addressing the needs of Black queer men</li>
        <li>Connect community members with professional services and resources</li>
      </ul>
      
      <p>Your participation helps us expand our reach and impact, ensuring that more Black queer men have access to the support and community they deserve.</p>
    `,
    image: '/lovable-uploads/community-support.jpg',
    coverImage: '/lovable-uploads/community-support-cover.jpg',
    category: 'community',
    progress: 65,
    goal: 200,
    participants: 124,
    startDate: '2023-05-15',
    endDate: '2023-08-15',
    organizer: {
      name: 'Marcus Johnson',
      role: 'Community Coordinator',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    updates: [
      {
        id: 1,
        title: 'New Community Space Secured',
        content: 'We\'ve secured a permanent location for our weekly community gatherings in Atlanta. This space will be available starting next month.',
        date: '2023-06-28',
        author: 'Marcus Johnson'
      },
      {
        id: 2,
        title: 'Mental Health Resources Added',
        content: 'We\'ve partnered with three therapists who specialize in supporting Black queer men. They will be offering reduced-rate sessions for community members.',
        date: '2023-06-15',
        author: 'Devon Williams'
      }
    ],
    events: [
      {
        id: 1,
        title: 'Community Gathering',
        description: 'Join us for an evening of connection and conversation.',
        date: '2023-07-15',
        time: '6:00 PM - 8:00 PM',
        location: 'Atlanta Community Center',
        virtual: false
      },
      {
        id: 2,
        title: 'Mental Health Workshop',
        description: 'Learn strategies for maintaining mental wellbeing as a Black queer man.',
        date: '2023-07-22',
        time: '7:00 PM - 8:30 PM',
        location: 'Zoom',
        virtual: true
      }
    ],
    resources: [
      {
        id: 1,
        title: 'Mental Health Guide',
        description: 'A comprehensive guide to mental health resources for Black queer men.',
        type: 'PDF',
        url: '/resources/mental-health-guide.pdf'
      },
      {
        id: 2,
        title: 'Community Support Directory',
        description: 'A directory of organizations and services supporting Black queer men.',
        type: 'Website',
        url: '/resources/community-directory'
      }
    ],
    supporters: [
      {
        id: 1,
        name: 'James Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        date: '2023-06-30'
      },
      {
        id: 2,
        name: 'Michael Thomas',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        date: '2023-06-29'
      },
      {
        id: 3,
        name: 'Robert Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        date: '2023-06-28'
      },
      {
        id: 4,
        name: 'David Smith',
        avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        date: '2023-06-27'
      },
      {
        id: 5,
        name: 'Christopher Brown',
        avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
        date: '2023-06-26'
      }
    ]
  },
  'mental-health': {
    id: 'mental-health',
    title: 'Mental Health Awareness',
    description: 'Resources and community support for mental health and wellbeing.',
    longDescription: `
      <p>The Mental Health Awareness campaign focuses on providing resources, support, and education around mental health specifically for Black queer men. We recognize the unique challenges faced by our community and aim to create spaces and resources that address these specific needs.</p>
      
      <p>This campaign includes:</p>
      <ul>
        <li>Weekly virtual support groups facilitated by licensed therapists</li>
        <li>Educational resources about mental health concerns affecting Black queer men</li>
        <li>Partnerships with mental health professionals who understand our community</li>
        <li>Workshops on coping strategies, self-care, and resilience</li>
      </ul>
      
      <p>By participating in this campaign, you're helping to break the stigma around mental health in our community and ensuring that more Black queer men have access to the support they need.</p>
    `,
    image: '/lovable-uploads/mental-health.jpg',
    coverImage: '/lovable-uploads/mental-health-cover.jpg',
    category: 'resources',
    progress: 42,
    goal: 150,
    participants: 87,
    startDate: '2023-06-01',
    endDate: '2023-09-30',
    organizer: {
      name: 'Devon Williams',
      role: 'Mental Health Advocate',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    updates: [
      {
        id: 1,
        title: 'New Support Group Launched',
        content: 'We\'ve launched a new weekly virtual support group specifically for young Black queer men under 25.',
        date: '2023-06-20',
        author: 'Devon Williams'
      }
    ],
    events: [
      {
        id: 1,
        title: 'Mental Health Workshop',
        description: 'Learn strategies for maintaining mental wellbeing as a Black queer man.',
        date: '2023-07-22',
        time: '7:00 PM - 8:30 PM',
        location: 'Zoom',
        virtual: true
      }
    ],
    resources: [
      {
        id: 1,
        title: 'Mental Health Guide',
        description: 'A comprehensive guide to mental health resources for Black queer men.',
        type: 'PDF',
        url: '/resources/mental-health-guide.pdf'
      }
    ],
    supporters: [
      {
        id: 1,
        name: 'James Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        date: '2023-06-30'
      },
      {
        id: 2,
        name: 'Michael Thomas',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        date: '2023-06-29'
      },
      {
        id: 3,
        name: 'Robert Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
        date: '2023-06-28'
      }
    ]
  }
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [joined, setJoined] = useState(false);
  
  // Get campaign data based on ID
  const campaign = campaignData[id || 'community-support'];
  
  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/campaigns">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const handleJoin = () => {
    setJoined(!joined);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative">
          <div className="h-64 md:h-80 lg:h-96 w-full overflow-hidden">
            <img 
              src={campaign.coverImage || campaign.image} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>
          
          <div className="container px-4 md:px-6 relative -mt-20 md:-mt-24">
            <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {campaign.category}
                      </Badge>
                      <Badge variant="secondary">
                        {getDaysRemaining()} days left
                      </Badge>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                      {campaign.title}
                    </h1>
                    
                    <p className="text-orange-500 text-sm font-medium mb-2">
                      Black Queer Realness - Unleashed
                    </p>
                    
                    <p className="text-muted-foreground mb-4">
                      {campaign.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Started {new Date(campaign.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        {campaign.participants} of {campaign.goal} participants
                      </div>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className={joined ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={handleJoin}
                    >
                      {joined ? (
                        <>
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Joined
                        </>
                      ) : (
                        <>
                          <HeartIcon className="mr-2 h-4 w-4" />
                          Join Campaign
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" size="lg">
                      <ShareIcon className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Campaign Content */}
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>About This Campaign</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div dangerouslySetInnerHTML={{ __html: campaign.longDescription }} />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Goals</CardTitle>
                        <CardDescription>What we aim to achieve through this initiative</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <span>Reach {campaign.goal} community members</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <span>Create sustainable support systems in key cities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <span>Develop and distribute resources specific to Black queer men's needs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-green-500/10 p-1 mt-0.5">
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <span>Build a network of professional services and resources</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="updates" className="space-y-6">
                    {campaign.updates.map(update => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{update.title}</CardTitle>
                            <Badge variant="outline">{new Date(update.date).toLocaleDateString()}</Badge>
                          </div>
                          <CardDescription>Posted by {update.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{update.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="events" className="space-y-6">
                    {campaign.events.map(event => (
                      <Card key={event.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{event.title}</CardTitle>
                            <Badge variant={event.virtual ? "secondary" : "default"}>
                              {event.virtual ? "Virtual" : "In Person"}
                            </Badge>
                          </div>
                          <CardDescription>{event.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <Button className="mt-4 w-full">RSVP</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="resources" className="space-y-6">
                    {campaign.resources.map(resource => (
                      <Card key={resource.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle>{resource.title}</CardTitle>
                            <Badge variant="outline">{resource.type}</Badge>
                          </div>
                          <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button asChild variant="outline" className="w-full">
                            <Link to={resource.url}>
                              Access Resource
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" x2="21" y1="14" y2="3" />
                              </svg>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={campaign.organizer.avatar} alt={campaign.organizer.name} />
                        <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{campaign.organizer.name}</div>
                        <div className="text-sm text-muted-foreground">{campaign.organizer.role}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Contact Organizer
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Supporters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.supporters.slice(0, 5).map(supporter => (
                        <div key={supporter.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={supporter.avatar} alt={supporter.name} />
                            <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="text-sm font-medium">{supporter.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Joined {new Date(supporter.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {campaign.supporters.length > 5 && (
                      <Button variant="link" className="w-full mt-2 p-0">
                        View all {campaign.supporters.length} supporters
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Share This Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-400">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect width="4" height="12" x="2" y="9" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Campaigns */}
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8">Related Campaigns</h2>
            <CampaignIntegration variant="minimal" showTabs={false} />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-blkout-900 text-white py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-bold">BLKOUTNXT</h3>
              <p className="text-sm text-white/70">Supporting Black queer men through community-focused initiatives and interconnected projects.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Projects</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/community" className="hover:text-white">Community Support</a></li>
                <li><a href="/projects" className="hover:text-white">Network Building</a></li>
                <li><a href="/resources" className="hover:text-white">Resource Hub</a></li>
                <li><a href="/events" className="hover:text-white">Events & Programs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/cookies" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-white/10" />
          <div className="text-center text-sm text-white/70">
            <p>© 2023 BLKOUTNXT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}