import { ReactNode, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  ActivityIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserIcon,
  Users2Icon,
  GiftIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

function SidebarItem({ icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const path = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <aside 
          className={`${
            collapsed ? 'w-[70px]' : 'w-64'
          } hidden md:block bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300`}
        >
          <div className="flex flex-col h-[calc(100vh-4rem)] p-2">
            <div className="flex items-center justify-end py-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCollapsed(!collapsed)}
                className="h-7 w-7"
              >
                {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
              </Button>
            </div>
            
            {!collapsed && user && (
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </div>
            )}
            
            {collapsed && user && (
              <div className="flex justify-center py-2 mb-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            )}
            
            <Separator className="my-2" />
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-1 py-2">
                <SidebarItem
                  icon={<HomeIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Dashboard"}
                  href="/dashboard"
                  active={path === '/dashboard'}
                />
                <SidebarItem
                  icon={<UserIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Profile"}
                  href="/profile"
                  active={path === '/profile'}
                />
                <SidebarItem
                  icon={<Users2Icon className="h-4 w-4" />}
                  label={collapsed ? '' : "Community"}
                  href="/community"
                  active={path === '/community'}
                />
                <SidebarItem
                  icon={<MessageSquareIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Messages"}
                  href="/messages"
                  active={path === '/messages'}
                  badge={3}
                />
                
                <Separator className="my-2" />
                
                <SidebarItem
                  icon={<FileTextIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Resources"}
                  href="/resources"
                  active={path === '/resources'}
                />
                <SidebarItem
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Events"}
                  href="/events"
                  active={path === '/events'}
                  badge={1}
                />
                <SidebarItem
                  icon={<ActivityIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Projects"}
                  href="/projects"
                  active={path.startsWith('/projects')}
                />
                <SidebarItem
                  icon={<FolderIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Submissions"}
                  href="/submissions"
                  active={path === '/submissions'}
                />
                <SidebarItem
                  icon={<GlobeIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Network"}
                  href="/network"
                  active={path === '/network'}
                />
                <SidebarItem
                  icon={<GiftIcon className="h-4 w-4" />}
                  label={collapsed ? '' : "Rewards"}
                  href="/dashboard/rewards"
                  active={path === '/dashboard/rewards'}
                />
              </div>
            </ScrollArea>
            
            <Separator className="my-2" />
            
            <div className="p-1">
              <SidebarItem
                icon={<SettingsIcon className="h-4 w-4" />}
                label={collapsed ? '' : "Settings"}
                href="/settings"
                active={path === '/settings'}
              />
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto bg-background">
          <div className="container py-6 md:py-8 px-4 md:px-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}