import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { 
  BellIcon, 
  CheckIcon, 
  MessageSquareIcon, 
  UserPlusIcon, 
  CalendarIcon,
  HeartIcon,
  XIcon
} from 'lucide-react';

export type NotificationType = 'system' | 'message' | 'connection' | 'event' | 'like';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface NotificationCardProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationCard({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = expanded 
    ? notifications 
    : notifications.slice(0, 3);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquareIcon className="h-4 w-4 text-blue-500" />;
      case 'connection':
        return <UserPlusIcon className="h-4 w-4 text-green-500" />;
      case 'event':
        return <CalendarIcon className="h-4 w-4 text-orange-500" />;
      case 'like':
        return <HeartIcon className="h-4 w-4 text-red-500" />;
      default:
        return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
          Mark all as read
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 rounded-lg border p-3"
              >
                {notification.user?.avatar && (
                  <img
                    src={notification.user.avatar}
                    alt={notification.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                    {notification.actionUrl && (
                      <Button variant="link" size="sm" asChild>
                        <a href={notification.actionUrl}>{notification.actionLabel}</a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(notification.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}