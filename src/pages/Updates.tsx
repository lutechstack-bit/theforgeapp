import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Users, BookOpen, Calendar, Map, Settings, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/shared/EmptyState';

interface Notification {
  id: string;
  type: 'COMMUNITY' | 'LEARN' | 'EVENTS' | 'ROADMAP' | 'SYSTEM';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'COMMUNITY',
    title: 'New message in community',
    message: 'Priya shared a new project in the community chat',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
  },
  {
    id: '2',
    type: 'LEARN',
    title: 'New content available',
    message: 'Check out the new masterclass on storytelling techniques',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
  },
  {
    id: '3',
    type: 'EVENTS',
    title: 'Upcoming event reminder',
    message: 'Weekly Community Call starts in 2 hours',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: false,
  },
  {
    id: '4',
    type: 'ROADMAP',
    title: 'Roadmap updated',
    message: 'Day 3 schedule has been finalized with mentor assignments',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
  },
  {
    id: '5',
    type: 'SYSTEM',
    title: 'Welcome to LevelUp!',
    message: 'Your account has been set up successfully. Explore the app!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: true,
  },
];

const Updates: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'COMMUNITY':
        return <Users className="h-4 w-4" />;
      case 'LEARN':
        return <BookOpen className="h-4 w-4" />;
      case 'EVENTS':
        return <Calendar className="h-4 w-4" />;
      case 'ROADMAP':
        return <Map className="h-4 w-4" />;
      case 'SYSTEM':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'COMMUNITY':
        return 'bg-blue-500/10 text-blue-400';
      case 'LEARN':
        return 'bg-purple-500/10 text-purple-400';
      case 'EVENTS':
        return 'bg-green-500/10 text-green-400';
      case 'ROADMAP':
        return 'bg-orange-500/10 text-orange-400';
      case 'SYSTEM':
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredNotifications = notifications.filter(
    (n) => filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="page-container max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-2">Updates</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
        <TabsList className="w-full bg-secondary/50 flex-wrap h-auto p-1">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="COMMUNITY" className="flex-1">Community</TabsTrigger>
          <TabsTrigger value="LEARN" className="flex-1">Learn</TabsTrigger>
          <TabsTrigger value="EVENTS" className="flex-1">Events</TabsTrigger>
        </TabsList>

        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up! New updates will appear here."
            />
          ) : (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer animate-fade-in ${
                  notification.isRead
                    ? 'bg-card border-border/50 hover:border-border'
                    : 'bg-gradient-to-r from-card to-primary/5 border-primary/20 hover:border-primary/40'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Updates;
