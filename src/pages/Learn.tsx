import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LearnCarousel } from '@/components/learn/LearnCarousel';
import { VideoPlayerModal } from '@/components/learn/VideoPlayerModal';
import { Users, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  instructor_name?: string;
  company_name?: string;
  full_description?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  category: string;
  order_index: number;
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
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LearnContent | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const { isFullAccess } = useAuth();

  // Fetch learn content from database
  const { data: courses, isLoading } = useQuery({
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

  // Filter content by section type
  const communityContent = courses?.filter(c => c.section_type === 'community_sessions') || [];
  const bfpContent = courses?.filter(c => c.section_type === 'bfp_sessions') || [];

  // Get unique categories from content
  const communityCategories = [...new Set(communityContent.map(c => c.category))];
  const bfpCategories = [...new Set(bfpContent.map(c => c.category))];

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header with Glass Effect */}
        <div className="glass-premium rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learn</h1>
          <p className="text-muted-foreground text-lg">
            Exclusive workshops, masterclasses, and resources from industry leaders
          </p>
        </div>

        {/* Main Tabs - Community Sessions & BFP Sessions */}
        <Tabs defaultValue="community" className="space-y-8">
          <TabsList className="bg-card/50 p-1 rounded-full border border-border/50 backdrop-blur-md">
            <TabsTrigger
              value="community"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Community Sessions
            </TabsTrigger>
            <TabsTrigger
              value="bfp"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              BFP Sessions
            </TabsTrigger>
          </TabsList>

          {/* Community Sessions Tab */}
          <TabsContent value="community" className="space-y-8 mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-video rounded-2xl glass-card animate-pulse" />
                ))}
              </div>
            ) : communityContent.length === 0 ? (
              <div className="text-center py-16 glass-premium rounded-2xl">
                <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No community sessions yet
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for recorded community calls and workshops
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Show by category or all */}
                {communityCategories.length > 1 ? (
                  communityCategories.map((category) => (
                    <LearnCarousel
                      key={category}
                      title={category}
                      items={communityContent.filter(c => c.category === category)}
                      isFullAccess={isFullAccess}
                      onItemClick={handlePlayContent}
                    />
                  ))
                ) : (
                  <LearnCarousel
                    title="Latest Sessions"
                    items={communityContent}
                    isFullAccess={isFullAccess}
                    onItemClick={handlePlayContent}
                  />
                )}
              </div>
            )}

            {/* Live Session Banner */}
            <div className="glass-premium rounded-2xl p-8 relative overflow-hidden">
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
                    Get access to exclusive insights from industry leaders.
                  </p>
                  <Button className="rounded-full bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground backdrop-blur-md transition-all duration-300">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* BFP Sessions Tab */}
          <TabsContent value="bfp" className="space-y-8 mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-video rounded-2xl glass-card animate-pulse" />
                ))}
              </div>
            ) : bfpContent.length === 0 ? (
              <div className="text-center py-16 glass-premium rounded-2xl">
                <BookOpen className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  BFP Sessions Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Pre-recorded workshops from Build For Purpose will be available here
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Show by category */}
                {bfpCategories.length > 1 ? (
                  bfpCategories.map((category) => (
                    <LearnCarousel
                      key={category}
                      title={category}
                      items={bfpContent.filter(c => c.category === category)}
                      isFullAccess={isFullAccess}
                      onItemClick={handlePlayContent}
                    />
                  ))
                ) : (
                  <LearnCarousel
                    title="Pre-recorded Workshops"
                    items={bfpContent}
                    isFullAccess={isFullAccess}
                    onItemClick={handlePlayContent}
                  />
                )}
              </div>
            )}

            {/* BFP Info Banner */}
            <div className="glass-premium rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 backdrop-blur-md border border-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-accent bg-accent/10 rounded-full border border-accent/20 backdrop-blur-sm mb-3">
                    Exclusive Content
                  </span>
                  <h3 className="font-bold text-foreground text-xl mb-2">Build For Purpose Archive</h3>
                  <p className="text-muted-foreground mb-4">
                    Access recordings from previous BFP sessions, workshops, and masterclasses. 
                    Learn from industry experts and past participants.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
          } : null}
          resources={resources}
        />

        <UnlockModal
          open={showUnlockModal}
          onOpenChange={setShowUnlockModal}
          title="Unlock Premium Content"
          description="This content is available to fully onboarded members. Complete your balance payment to access all exclusive videos, sessions, and mentorship content."
        />
      </div>
    </div>
  );
};

export default Learn;