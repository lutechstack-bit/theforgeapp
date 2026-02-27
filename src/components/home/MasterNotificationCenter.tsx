import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSessionNotifications, type SessionNotification } from '@/hooks/useSessionNotifications';
import { 
  Bell, ArrowRight, Users, BookOpen, Calendar, Map, Settings,
  CheckCircle2, Sparkles, TrendingUp, Clock, Video, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, addDays, format, isToday, isTomorrow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateYahooCalendarUrl, generateAppleCalendarUrl } from '@/lib/calendarUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

// Card configurations with vibrant colors matching reference
const categoryConfig: Record<string, { 
  bg: string; 
  iconBg: string;
  icon: React.ElementType;
  label: string;
  accent: string;
}> = {
  COMMUNITY: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10',
    iconBg: 'bg-blue-500',
    icon: Users,
    label: 'Community',
    accent: 'text-blue-400'
  },
  LEARN: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
    iconBg: 'bg-purple-500',
    icon: BookOpen,
    label: 'Learn',
    accent: 'text-purple-400'
  },
  EVENTS: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10',
    iconBg: 'bg-emerald-500',
    icon: Calendar,
    label: 'Events',
    accent: 'text-emerald-400'
  },
  ROADMAP: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
    iconBg: 'bg-amber-500',
    icon: Map,
    label: 'Roadmap',
    accent: 'text-amber-400'
  },
  SYSTEM: {
    bg: 'bg-gradient-to-br from-primary/20 to-primary/10',
    iconBg: 'bg-primary',
    icon: Settings,
    label: 'System',
    accent: 'text-primary'
  }
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  onClick: () => void;
}> = ({ notification, onClick }) => {
  const config = categoryConfig[notification.type] || categoryConfig.SYSTEM;
  const IconComponent = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-[260px] sm:w-[280px] p-4 rounded-2xl cursor-pointer",
        "border border-border/50 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20",
        config.bg
      )}
    >
      {/* Top row: Icon + Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          config.iconBg
        )}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-[10px] px-2 py-0.5 bg-background/50", config.accent)}
        >
          {config.label}
        </Badge>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
        {notification.title}
      </h4>

      {/* Body preview */}
      {notification.body && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {notification.body}
        </p>
      )}

      {/* Footer: Time + Arrow */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </span>
        {notification.deep_link && (
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

// Event Card Component (for reminders)
const EventReminderCard: React.FC<{
  event: Event;
  onClick: () => void;
}> = ({ event, onClick }) => {
  const eventDate = new Date(event.event_date);
  const isUrgent = isToday(eventDate) || isTomorrow(eventDate);
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-[260px] sm:w-[280px] p-4 rounded-2xl cursor-pointer",
        "border border-border/50 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20",
        isUrgent 
          ? "bg-gradient-to-br from-rose-500/20 to-rose-600/10"
          : "bg-gradient-to-br from-teal-500/20 to-teal-600/10"
      )}
    >
      {/* Top row: Icon + Date badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isUrgent ? "bg-rose-500" : "bg-teal-500"
        )}>
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-2 py-0.5 bg-background/50",
            isUrgent ? "text-rose-400" : "text-teal-400"
          )}
        >
          {isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'EEE, MMM d')}
        </Badge>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">
        {event.title}
      </h4>

      {/* Location */}
      {event.location && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
          <Map className="w-3 h-3" />
          {event.location}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary" 
          className="text-[10px] px-2 py-0.5"
        >
          {event.is_virtual ? '🌐 Virtual' : '📍 In-Person'}
        </Badge>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};

// Session Notification Card Component
const SessionNotificationCard: React.FC<{
  session: SessionNotification;
  onClick: () => void;
}> = ({ session, onClick }) => {
  const isLive = session.status === 'live';
  const isStartingSoon = session.status === 'starting_soon';

  const handleJoinMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
  };

  const getCalendarEvent = () => ({
    title: session.title,
    description: `Join Zoom Meeting: ${session.meetingUrl}`,
    location: session.meetingUrl,
    startDate: session.sessionDate,
    endDate: new Date(session.sessionDate.getTime() + (session.sessionDurationHours || 2) * 60 * 60 * 1000),
    isVirtual: true,
  });

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateGoogleCalendarUrl(getCalendarEvent());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAppleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateAppleCalendarUrl(getCalendarEvent());
    window.open(url, '_blank');
  };

  const handleOutlookCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateOutlookCalendarUrl(getCalendarEvent());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleYahooCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateYahooCalendarUrl(getCalendarEvent());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-[280px] sm:w-[300px] p-4 rounded-2xl cursor-pointer",
        "border transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20",
        isLive 
          ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30"
          : isStartingSoon
          ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30"
          : "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30"
      )}
    >
      {/* Top row: Icon + Status badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isLive ? "bg-red-500" : isStartingSoon ? "bg-amber-500" : "bg-blue-500"
        )}>
          <Video className="w-5 h-5 text-white" />
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-2 py-0.5 bg-background/50",
            isLive 
              ? "text-red-400 border-red-400/30 animate-pulse" 
              : isStartingSoon 
              ? "text-amber-400 border-amber-400/30" 
              : "text-blue-400 border-blue-400/30"
          )}
        >
          {isLive ? '🔴 LIVE NOW' : isStartingSoon ? `⏰ ${session.minutesUntilStart}m` : format(session.sessionDate, 'h:mm a')}
        </Badge>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
        Day {session.dayNumber}: {session.title}
      </h4>

      {/* Subtitle */}
      <p className="text-xs text-muted-foreground mb-3">
        {isLive 
          ? "Your session is live! Join now."
          : isStartingSoon 
          ? `Starting in ${session.minutesUntilStart} minutes`
          : `Scheduled for ${format(session.sessionDate, 'h:mm a')}`
        }
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className={cn(
            "gap-1 flex-1 h-8 text-xs text-white",
            isLive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={handleJoinMeeting}
        >
          <Video className="w-3 h-3" />
          {isLive ? 'Join Now' : 'Join Zoom'}
          <ExternalLink className="w-3 h-3" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={(e) => e.stopPropagation()}>
              <Calendar className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleGoogleCalendar}>
              📅 Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAppleCalendar}>
              🍎 Apple Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOutlookCalendar}>
              📧 Outlook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleYahooCalendar}>
              📆 Yahoo Calendar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  value: string;
  label: string;
  color: string;
  icon: React.ElementType;
}> = ({ value, label, color, icon: Icon }) => (
  <div className={cn(
    "flex-shrink-0 w-[140px] sm:w-[160px] p-4 rounded-2xl",
    "border border-border/50",
    color
  )}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <Icon className="w-5 h-5 text-foreground/60" />
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export const MasterNotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { profile, forgeMode } = useAuth();
  const { todaysSessions, urgentNotification } = useSessionNotifications();

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

  // Display notifications (pinned first)
  const displayNotifications = useMemo(() => {
    const pinned = notifications.filter(n => n.pinned);
    const nonPinned = notifications.filter(n => !n.pinned);
    return [...pinned, ...nonPinned].slice(0, 8);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.deep_link) {
      navigate(notification.deep_link);
    }
  };

  const handleEventClick = () => {
    navigate('/events');
  };

  const handleSessionClick = () => {
    navigate('/roadmap/journey');
  };

  const totalItems = notifications.length + upcomingEvents.length + todaysSessions.length;

  return (
    <div className="space-y-5 reveal-section" style={{ animationDelay: '0.1s' }}>
      {/* Header: Greeting + Avatar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-primary/30 ring-2 ring-primary/10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {getGreeting()}, {firstName}!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalItems > 0 
                ? `You have ${totalItems} update${totalItems > 1 ? 's' : ''} to check`
                : "You're all caught up! 🎉"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/updates')}
          className="rounded-full glass-card-hover relative"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Button>
      </div>

      {/* Quick Stats Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {todaysSessions.length > 0 && (
          <StatsCard 
            value={`${todaysSessions.length}`} 
            label="Live Sessions Today" 
            color="bg-gradient-to-br from-red-500/15 to-red-600/5"
            icon={Video}
          />
        )}
        <StatsCard 
          value={`${notifications.length}`} 
          label="New Updates" 
          color="bg-gradient-to-br from-purple-500/15 to-purple-600/5"
          icon={Sparkles}
        />
        <StatsCard 
          value={`${upcomingEvents.length}`} 
          label="Upcoming Events" 
          color="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5"
          icon={Calendar}
        />
        <StatsCard 
          value="78%" 
          label="Profile Complete" 
          color="bg-gradient-to-br from-amber-500/15 to-amber-600/5"
          icon={TrendingUp}
        />
      </div>

      {/* Live Sessions Section - Show prominently during DURING_FORGE */}
      {todaysSessions.length > 0 && forgeMode === 'DURING_FORGE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Video className="w-4 h-4 text-red-400" />
              {urgentNotification?.status === 'live' ? '🔴 Live Session' : 'Today\'s Sessions'}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/roadmap/journey')}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              View Roadmap
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {todaysSessions.map((session) => (
              <SessionNotificationCard
                key={session.id}
                session={session}
                onClick={handleSessionClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Updates Section */}
      {displayNotifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Latest Updates
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/updates')}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              See All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {displayNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reminders Section */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Upcoming Reminders
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/events')}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              View Events
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {upcomingEvents.map((event) => (
              <EventReminderCard
                key={event.id}
                event={event}
                onClick={handleEventClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayNotifications.length === 0 && upcomingEvents.length === 0 && (
        <div className="p-8 rounded-2xl glass-card text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground">
            No new updates or reminders. Enjoy your day!
          </p>
        </div>
      )}
    </div>
  );
};
