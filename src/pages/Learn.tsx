import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { ContinueWatchingCarousel } from '@/components/learn/ContinueWatchingCarousel';
import { Film, Sparkles, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';


const PAYMENT_LINK = "https://razorpay.com/payment-link/your-link-here";

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_source_type?: 'upload' | 'embed';
  instructor_name?: string;
  company_name?: string;
  full_description?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  category: string;
  order_index: number;
}

interface WatchProgress {
  learn_content_id: string;
  progress_seconds: number;
  total_seconds?: number;
  completed: boolean;
}


const Learn: React.FC = () => {
  const navigate = useNavigate();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { user, isFullAccess } = useAuth();

  // Fetch learn content
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['learn_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as LearnContent[];
    },
  });

  // Fetch user's watch progress
  const { data: watchProgress = [] } = useQuery({
    queryKey: ['learn_watch_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('learn_watch_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as WatchProgress[];
    },
    enabled: !!user?.id,
  });


  // Calculate progress for each content
  const getProgressPercent = (contentId: string, durationMinutes?: number) => {
    const progress = watchProgress.find(p => p.learn_content_id === contentId);
    if (!progress) return 0;
    const totalSeconds = progress.total_seconds || (durationMinutes ? durationMinutes * 60 : 0);
    if (!totalSeconds) return 0;
    return Math.round((progress.progress_seconds / totalSeconds) * 100);
  };

  const isCompleted = (contentId: string) => {
    const progress = watchProgress.find(p => p.learn_content_id === contentId);
    return progress?.completed || false;
  };

  const handleCardClick = (content: LearnContent) => {
    if (content.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    navigate(`/learn/${content.id}`);
  };

  // Group content by section_type
  const forgeOnlineSessions = courses.filter(c => c.section_type === 'bfp_sessions');
  const communitySessions = courses.filter(c => c.section_type === 'community_sessions');

  // Prepare continue watching items
  const continueWatchingItems = courses
    .filter(c => {
      const progress = getProgressPercent(c.id, c.duration_minutes);
      return progress > 0 && !isCompleted(c.id);
    })
    .map(c => ({
      id: c.id,
      title: c.title,
      thumbnail_url: c.thumbnail_url,
      instructor_name: c.instructor_name,
      duration_minutes: c.duration_minutes,
      progress_percent: getProgressPercent(c.id, c.duration_minutes),
      is_completed: isCompleted(c.id),
    }))
    .sort((a, b) => b.progress_percent - a.progress_percent);

  const renderCourseCarousel = (items: LearnContent[], title: string, subtitle?: string) => {
    if (items.length === 0) return null;

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {items.length > 3 && (
            <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: items.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 py-4 -my-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 basis-auto"
              >
                <LearnCourseCard
                  id={item.id}
                  title={item.title}
                  thumbnailUrl={item.thumbnail_url}
                  durationMinutes={item.duration_minutes}
                  isLocked={item.is_premium && !isFullAccess}
                  onClick={() => handleCardClick(item)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {items.length > 3 && (
            <>
              <CarouselPrevious className="-left-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
              <CarouselNext className="-right-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
            </>
          )}
        </Carousel>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-3 sm:p-4 space-y-6 sm:space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pre Forge Sessions</h1>
          </div>
          <p className="text-muted-foreground">
            Learn from industry experts and breakthrough filmmakers
          </p>
        </div>

        {/* Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatchingCarousel
            items={continueWatchingItems}
            onItemClick={(item) => {
              const content = courses.find(c => c.id === item.id);
              if (content) handleCardClick(content);
            }}
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl">
            <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No sessions yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon for new content
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Pre Forge Sessions */}
            {renderCourseCarousel(
              forgeOnlineSessions,
              'Pre Forge Sessions',
              'Exclusive sessions to prepare you for the Forge'
            )}

            {/* Community Sessions */}
            {renderCourseCarousel(
              communitySessions,
              'Community Sessions',
              'Workshops and masterclasses from industry leaders'
            )}
          </div>
        )}
      </div>


      {/* Unlock Modal */}
      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        title="Unlock Premium Content"
        description="Complete your payment to access exclusive masterclasses and workshops."
        paymentLink={PAYMENT_LINK}
      />
    </div>
  );
};

export default Learn;
