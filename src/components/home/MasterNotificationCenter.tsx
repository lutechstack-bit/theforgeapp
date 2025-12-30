import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ArrowRight, Pin, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  pinned: boolean;
  priority: number;
  created_at: string;
}

const typeColors: Record<string, string> = {
  COMMUNITY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LEARN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  EVENTS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  EVENT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ROADMAP: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SYSTEM: 'bg-primary/20 text-primary border-primary/30'
};

export const MasterNotificationCenter: React.FC = () => {
  const navigate = useNavigate();

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
        .limit(8);
      if (error) throw error;
      return data as Notification[];
    }
  });

  // Fetch hero banners
  const { data: banners = [] } = useQuery({
    queryKey: ['home-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as HeroBanner[];
    }
  });

  // FOMO Logic: Randomize non-pinned from latest 8, but keep pinned first
  const displayNotifications = useMemo(() => {
    const pinned = notifications.filter(n => n.pinned);
    const nonPinned = notifications.filter(n => !n.pinned);
    
    // Shuffle non-pinned
    const shuffled = [...nonPinned].sort(() => Math.random() - 0.5);
    
    // Take 2-3 items: all pinned + fill from shuffled
    const maxItems = 3;
    const pinnedToShow = pinned.slice(0, maxItems);
    const remaining = maxItems - pinnedToShow.length;
    const nonPinnedToShow = shuffled.slice(0, remaining);
    
    return [...pinnedToShow, ...nonPinnedToShow];
  }, [notifications]);

  // Featured banners: primary (pinned first) + optional secondary
  const primaryBanner = banners.find(b => b.pinned) || banners[0];
  const secondaryBanners = banners.filter(b => b.id !== primaryBanner?.id);
  const secondaryBanner = secondaryBanners.length > 0 
    ? secondaryBanners[Math.floor(Math.random() * secondaryBanners.length)]
    : null;

  const handleNotificationClick = (notification: Notification) => {
    if (notification.deep_link) {
      navigate(notification.deep_link);
    }
  };

  const handleBannerClick = (banner: HeroBanner) => {
    if (banner.cta_link) {
      navigate(banner.cta_link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Master Notification Center</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          What's moving inside Forge right now—new drops, key calls, and what to do next.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* SECTION 1: What's New (Auto Updates) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">What's New</h3>
            </div>
          </div>

          <div className="space-y-2">
            {displayNotifications.length === 0 ? (
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  No fresh drops yet. Keep an eye here.
                </p>
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="group p-3 rounded-xl bg-card/60 border border-border/50 cursor-pointer hover:border-primary/30 hover:bg-card/80 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {notification.pinned && (
                          <Pin className="h-3 w-3 text-primary shrink-0" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1.5 py-0 ${typeColors[notification.type] || typeColors.SYSTEM}`}
                        >
                          {notification.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {notification.body}
                        </p>
                      )}
                    </div>
                    {notification.deep_link && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/updates')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            View all updates
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* SECTION 2: Featured (Admin Fixed Banners) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Featured</h3>
          </div>

          <div className="space-y-2">
            {/* Primary Banner */}
            {primaryBanner ? (
              <div
                onClick={() => handleBannerClick(primaryBanner)}
                className={`relative overflow-hidden rounded-xl cursor-pointer group transition-all hover:ring-2 hover:ring-primary/30 ${
                  primaryBanner.image_url ? 'min-h-[140px]' : 'p-4 bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20'
                }`}
              >
                {primaryBanner.image_url && (
                  <img 
                    src={primaryBanner.image_url} 
                    alt={primaryBanner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className={`relative z-10 ${primaryBanner.image_url ? 'p-4 bg-gradient-to-t from-background/90 via-background/50 to-transparent min-h-[140px] flex flex-col justify-end' : ''}`}>
                  {primaryBanner.pinned && (
                    <div className="flex items-center gap-1 mb-1">
                      <Pin className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary font-medium">PINNED</span>
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground">{primaryBanner.title}</h4>
                  {primaryBanner.subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{primaryBanner.subtitle}</p>
                  )}
                  {primaryBanner.cta_text && (
                    <Button 
                      size="sm" 
                      className="mt-3 w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(primaryBanner);
                      }}
                    >
                      {primaryBanner.cta_text}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  No featured banners yet.
                </p>
              </div>
            )}

            {/* Secondary Banner (smaller) */}
            {secondaryBanner && (
              <div
                onClick={() => handleBannerClick(secondaryBanner)}
                className="p-3 rounded-xl bg-card/60 border border-border/50 cursor-pointer hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{secondaryBanner.title}</p>
                    {secondaryBanner.subtitle && (
                      <p className="text-xs text-muted-foreground">{secondaryBanner.subtitle}</p>
                    )}
                  </div>
                  {secondaryBanner.cta_link && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
