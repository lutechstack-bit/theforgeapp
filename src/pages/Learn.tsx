import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { ProgramTabs } from '@/components/learn/ProgramTabs';
import { PremiumVideoCarousel } from '@/components/learn/PremiumVideoCarousel';
import { ContinueWatchingCarousel } from '@/components/learn/ContinueWatchingCarousel';
import { InstructorSpotlight } from '@/components/learn/InstructorSpotlight';
import { VideoPlayerModal } from '@/components/learn/VideoPlayerModal';
import { Film, Sparkles, Lock, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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
  program_id?: string;
}

interface LearnProgram {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  instructor_name?: string;
  instructor_avatar?: string;
  instructor_bio?: string;
  order_index: number;
}

interface WatchProgress {
  learn_content_id: string;
  progress_seconds: number;
  total_seconds?: number;
  completed: boolean;
}

interface LearnResource {
  id: string;
  learn_content_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size_mb?: number;
}

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LearnContent | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const { user, isFullAccess, isBalancePaid } = useAuth();

  // Fetch programs
  const { data: programs = [] } = useQuery({
    queryKey: ['learn_programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_programs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as LearnProgram[];
    },
  });

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

  // Fetch resources for selected content
  const { data: resources } = useQuery({
    queryKey: ['learn_resources', selectedContent?.id],
    queryFn: async () => {
      if (!selectedContent?.id) return [];
      const { data, error } = await supabase
        .from('learn_resources')
        .select('*')
        .eq('learn_content_id', selectedContent.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as LearnResource[];
    },
    enabled: !!selectedContent?.id,
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

  const handlePlayContent = (content: LearnContent) => {
    if (content.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    
    if (!content.video_url) {
      toast.error('Video not available for this content');
      return;
    }
    
    setSelectedContent(content);
    setShowVideoPlayer(true);
  };

  // Filter content
  const filteredContent = selectedProgramId
    ? courses.filter(c => c.program_id === selectedProgramId)
    : courses;

  // Group content by category
  const categories = [...new Set(filteredContent.map(c => c.category))];

  // Get featured program (first with instructor info)
  const featuredProgram = programs.find(p => p.instructor_name && p.instructor_bio);

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Forge Online Sessions</h1>
          </div>
          <p className="text-muted-foreground">
            Exclusive workshops, masterclasses, and resources from industry leaders
          </p>
        </div>

        {/* Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatchingCarousel
            items={continueWatchingItems}
            onItemClick={(item) => {
              const content = courses.find(c => c.id === item.id);
              if (content) handlePlayContent(content);
            }}
          />
        )}

        {/* Program Filter Tabs */}
        <ProgramTabs
          programs={programs}
          selectedProgramId={selectedProgramId}
          onSelectProgram={setSelectedProgramId}
        />

        {/* Featured Instructor Spotlight */}
        {featuredProgram && !selectedProgramId && (
          <InstructorSpotlight
            name={featuredProgram.instructor_name || 'Expert Instructor'}
            avatar={featuredProgram.instructor_avatar}
            bio={featuredProgram.instructor_bio}
            programName={featuredProgram.name}
            thumbnailUrl={featuredProgram.thumbnail_url}
            onViewProgram={() => setSelectedProgramId(featuredProgram.id)}
          />
        )}

        {/* Content Sections */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredContent.length === 0 ? (
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
            {categories.map((category) => {
              const categoryContent = filteredContent
                .filter(c => c.category === category)
                .map(c => ({
                  ...c,
                  progress_percent: getProgressPercent(c.id, c.duration_minutes),
                  is_completed: isCompleted(c.id),
                }));

              return (
                <PremiumVideoCarousel
                  key={category}
                  title={category}
                  items={categoryContent}
                  isFullAccess={isFullAccess}
                  onItemClick={handlePlayContent}
                />
              );
            })}
          </div>
        )}

        {/* Live Session Banner */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm mb-3">
                Live Session
              </span>
              <h3 className="font-bold text-foreground text-xl mb-2">Weekly Community Call</h3>
              <p className="text-muted-foreground mb-4">
                Join fellow creators every Friday at 6 PM IST for discussions, Q&A, and networking.
              </p>
              <Button className="rounded-full gap-2" variant="outline">
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoPlayer}
        onOpenChange={setShowVideoPlayer}
        content={selectedContent ? {
          id: selectedContent.id,
          title: selectedContent.title,
          video_url: selectedContent.video_url || '',
          thumbnail_url: selectedContent.thumbnail_url,
          instructor_name: selectedContent.instructor_name,
          company_name: selectedContent.company_name,
          full_description: selectedContent.full_description,
          duration_minutes: selectedContent.duration_minutes,
          video_source_type: (selectedContent.video_source_type as 'upload' | 'embed') || 'upload',
        } : undefined}
        resources={resources?.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          file_url: r.file_url,
          file_type: r.file_type,
          file_size_mb: r.file_size_mb,
        }))}
      />

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
