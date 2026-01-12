import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, ArrowRight, Pin, Clock, ExternalLink, 
  Users, BookOpen, Calendar, Map, Settings,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format, isToday, isTomorrow, addDays, isBefore } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  deep_link: string | null;
  pinned: boolean;
  priority: number;
  created_at: string;
  expiry_at: string | null;
  auto_update: boolean;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  is_virtual: boolean;
}

// Card color schemes by type
const typeStyles: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  COMMUNITY: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  LEARN: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  EVENTS: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  ROADMAP: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  SYSTEM: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: 'text-primary',
    badge: 'bg-primary/20 text-primary border-primary/30'
  }
};

const typeIcons: Record<string, React.ElementType> = {
  COMMUNITY: Users,
  LEARN: BookOpen,
  EVENTS: Calendar,
  ROADMAP: Map,
  SYSTEM: Settings
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
  return format(date, 'EEE, MMM d');
};

export const MasterNotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('updates');

  // Extract first name from profile
  const firstName = profile?.full_name?.split(' ')[0] || 'Creator';

  // Fetch auto-update notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['home-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, deep_link, pinned, priority, created_at, expiry_at, auto_update')
        .eq('auto_update', true)
        .or(`expiry_at.is.null,expiry_at.gt.${new Date().toISOString()}`)
        .order('pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Notification[];
    }
  });

  // Fetch upcoming events as reminders
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['home-reminders'],
    queryFn: async () => {
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, location, is_virtual')
        .gte('event_date', now.toISOString())
        .lte('event_date', weekFromNow.toISOString())
        .order('event_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data as Event[];
    }
  });

  // Get display notifications (pinned first, then shuffle non-pinned for FOMO)
  const displayNotifications = useMemo(() => {
    const pinned = notifications.filter(n => n.pinned);
    const nonPinned = notifications.filter(n => !n.pinned);
    const shuffled = [...nonPinned].sort(() => Math.random() - 0.5);
    return [...pinned, ...shuffled].slice(0, 5);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.deep_link) {
      navigate(notification.deep_link);
    }
  };

  const handleEventClick = (event: Event) => {
    navigate(`/events`);
  };

  const updatesCount = notifications.length;
  const remindersCount = upcomingEvents.length;

  return (
    <div className="space-y-4 reveal-section" style={{ animationDelay: '0.1s' }}>
      {/* Personalized Greeting Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}!
            </h2>
            <p className="text-sm text-muted-foreground">
              {updatesCount + remindersCount > 0 
                ? `You have ${updatesCount + remindersCount} item${updatesCount + remindersCount > 1 ? 's' : ''} to check`
                : "You're all caught up!"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/updates')}
          className="rounded-full glass-card-hover"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="updates" 
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="h-4 w-4 mr-2" />
            Updates {updatesCount > 0 && `(${updatesCount})`}
          </TabsTrigger>
          <TabsTrigger 
            value="reminders"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Reminders {remindersCount > 0 && `(${remindersCount})`}
          </TabsTrigger>
        </TabsList>

        {/* Updates Tab */}
        <TabsContent value="updates" className="mt-4 space-y-3">
          {displayNotifications.length === 0 ? (
            <div className="p-6 rounded-xl glass-card text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No new updates. Check back later!
              </p>
            </div>
          ) : (
            displayNotifications.map((notification) => {
              const style = typeStyles[notification.type] || typeStyles.SYSTEM;
              const IconComponent = typeIcons[notification.type] || Settings;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]",
                    style.bg,
                    style.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg bg-background/50", style.icon)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.pinned && (
                          <Pin className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] px-1.5 py-0", style.badge)}
                        >
                          {notification.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notification.body}
                        </p>
                      )}
                    </div>
                    {notification.deep_link && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {displayNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/updates')}
              className="w-full text-muted-foreground hover:text-foreground glass-card-hover rounded-xl"
            >
              View all updates
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="mt-4 space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="p-6 rounded-xl glass-card text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming events this week.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/events')}
                className="mt-3"
              >
                Browse Events
              </Button>
            </div>
          ) : (
            upcomingEvents.map((event) => {
              const eventDate = new Date(event.event_date);
              const isUrgent = isToday(eventDate) || isTomorrow(eventDate);
              
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    "group p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]",
                    isUrgent 
                      ? "bg-amber-500/10 border-amber-500/20" 
                      : "bg-emerald-500/10 border-emerald-500/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-background/50",
                      isUrgent ? "text-amber-400" : "text-emerald-400"
                    )}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isUrgent && (
                          <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            isUrgent 
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {event.is_virtual ? 'Virtual' : 'In-Person'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground ml-auto font-medium">
                          {formatEventDate(event.event_date)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Map className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>
              );
            })
          )}

          {upcomingEvents.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/events')}
              className="w-full text-muted-foreground hover:text-foreground glass-card-hover rounded-xl"
            >
              View all events
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
