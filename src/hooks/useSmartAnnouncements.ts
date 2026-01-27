import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentJourney } from '@/hooks/useStudentJourney';
import { useStreak } from '@/hooks/useStreak';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, differenceInHours } from 'date-fns';

interface SmartAnnouncement {
  id: string;
  type: string;
  title: string;
  message?: string;
  deepLink?: string;
  icon: string;
  priority: number;
  isManual: boolean;
}

interface AnnouncementTrigger {
  id: string;
  trigger_type: string;
  title_template: string;
  message_template: string | null;
  deep_link: string | null;
  icon_emoji: string;
  is_active: boolean;
  priority: number;
  config: Record<string, any>;
}

export const useSmartAnnouncements = () => {
  const { user, profile, edition } = useAuth();
  const { currentStage, currentStageKey } = useStudentJourney();
  const { streak } = useStreak();

  // Fetch trigger configurations
  const { data: triggers } = useQuery({
    queryKey: ['announcement_triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcement_triggers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as AnnouncementTrigger[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch manual hero announcements
  const { data: manualAnnouncements } = useQuery({
    queryKey: ['hero_announcements', user?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_hero_announcement', true)
        .or(`expiry_at.is.null,expiry_at.gt.${now}`)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  // Compute smart announcements based on user state
  const smartAnnouncements = useMemo(() => {
    const announcements: SmartAnnouncement[] = [];
    
    if (!triggers) return announcements;

    const forgeStartDate = edition?.forge_start_date 
      ? new Date(edition.forge_start_date) 
      : null;
    
    const daysUntilForge = forgeStartDate 
      ? differenceInDays(forgeStartDate, new Date()) 
      : null;

    // Process each trigger
    triggers.forEach((trigger) => {
      switch (trigger.trigger_type) {
        case 'kyf_deadline': {
          // Check if KYF is incomplete and deadline is approaching
          const kyFormCompleted = profile?.ky_form_completed;
          const daysBeforeConfig = trigger.config?.days_before || [3, 2, 1];
          
          if (!kyFormCompleted && daysUntilForge !== null && daysBeforeConfig.includes(daysUntilForge)) {
            announcements.push({
              id: `smart_kyf_${daysUntilForge}`,
              type: trigger.trigger_type,
              title: trigger.title_template.replace('{days}', String(daysUntilForge)),
              message: trigger.message_template || undefined,
              deepLink: trigger.deep_link || undefined,
              icon: trigger.icon_emoji,
              priority: trigger.priority,
              isManual: false,
            });
          }
          break;
        }
        
        case 'forge_countdown': {
          // Check if we're at a countdown milestone
          const daysConfig = trigger.config?.days || [14, 7, 3, 1, 0];
          
          if (daysUntilForge !== null && daysConfig.includes(daysUntilForge)) {
            const title = daysUntilForge === 0 
              ? '🎬 Forge starts today!' 
              : trigger.title_template.replace('{days}', String(daysUntilForge));
            
            announcements.push({
              id: `smart_countdown_${daysUntilForge}`,
              type: trigger.trigger_type,
              title,
              message: trigger.message_template || undefined,
              deepLink: trigger.deep_link || undefined,
              icon: trigger.icon_emoji,
              priority: trigger.priority,
              isManual: false,
            });
          }
          break;
        }
        
        case 'streak_milestone': {
          // Check if user hit a streak milestone
          const streakDaysConfig = trigger.config?.days || [3, 7, 14, 30];
          
          if (streak && streakDaysConfig.includes(streak)) {
            announcements.push({
              id: `smart_streak_${streak}`,
              type: trigger.trigger_type,
              title: trigger.title_template.replace('{days}', String(streak)),
              message: trigger.message_template || undefined,
              deepLink: trigger.deep_link || undefined,
              icon: trigger.icon_emoji,
              priority: trigger.priority,
              isManual: false,
            });
          }
          break;
        }
        
        // Add more trigger types as needed
      }
    });

    return announcements;
  }, [triggers, profile, edition, streak, currentStageKey]);

  // Combine manual and smart announcements, sorted by priority
  const allAnnouncements = useMemo(() => {
    const combined: SmartAnnouncement[] = [];

    // Add manual announcements first (higher priority)
    manualAnnouncements?.forEach((notification) => {
      combined.push({
        id: notification.id,
        type: 'manual',
        title: notification.title,
        message: notification.body || notification.message || undefined,
        deepLink: notification.deep_link || notification.link || undefined,
        icon: notification.icon_emoji || '📢',
        priority: notification.priority + 100, // Manual always higher
        isManual: true,
      });
    });

    // Add smart announcements
    combined.push(...smartAnnouncements);

    // Sort by priority (highest first)
    return combined.sort((a, b) => b.priority - a.priority);
  }, [manualAnnouncements, smartAnnouncements]);

  // Get dismissed announcement IDs from localStorage
  const getDismissedIds = (): string[] => {
    try {
      const stored = localStorage.getItem('dismissed_announcements');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Clean up old dismissals (older than 24 hours)
      const now = Date.now();
      const validDismissals = Object.entries(parsed)
        .filter(([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000)
        .map(([id]) => id);
      return validDismissals;
    } catch {
      return [];
    }
  };

  // Dismiss an announcement
  const dismissAnnouncement = (announcementId: string) => {
    try {
      const stored = localStorage.getItem('dismissed_announcements');
      const dismissals = stored ? JSON.parse(stored) : {};
      dismissals[announcementId] = Date.now();
      localStorage.setItem('dismissed_announcements', JSON.stringify(dismissals));
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  // Filter out dismissed announcements
  const activeAnnouncements = useMemo(() => {
    const dismissedIds = getDismissedIds();
    return allAnnouncements.filter(a => !dismissedIds.includes(a.id));
  }, [allAnnouncements]);

  return {
    announcements: activeAnnouncements,
    dismissAnnouncement,
    isLoading: !triggers,
  };
};
