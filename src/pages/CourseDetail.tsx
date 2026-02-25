import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecureVideoPlayer } from '@/components/learn/SecureVideoPlayer';
import { ContentSidebar } from '@/components/learn/ContentSidebar';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  FileText, 
  Download,
  BookOpen,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  full_description?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_source_type?: 'upload' | 'embed';
  instructor_name?: string;
  instructor_avatar_url?: string;
  company_name?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  category: string;
  bonuses?: any;
}

interface LearnResource {
  id: string;
  learn_content_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size_mb?: number;
  is_premium: boolean;
}

interface WatchProgress {
  id: string;
  user_id: string;
  learn_content_id: string;
  progress_seconds: number;
  total_seconds: number | null;
  completed: boolean;
  last_watched_at: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isFullAccess, user } = useAuth();
  const isMobile = useIsMobile();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Fetch course details
  const { data: course, isLoading } = useQuery({
    queryKey: ['learn_content', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as LearnContent;
    },
    enabled: !!id,
  });

  // Fetch resources for this course
  const { data: resources } = useQuery({
    queryKey: ['learn_resources', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('learn_resources')
        .select('*')
        .eq('learn_content_id', id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as LearnResource[];
    },
    enabled: !!id,
  });

  // Fetch sibling content (same section_type + category)
  const { data: siblings } = useQuery({
    queryKey: ['learn_siblings', course?.section_type, course?.category],
    queryFn: async () => {
      if (!course) return [];
      const { data, error } = await supabase
        .from('learn_content')
        .select('id, title, duration_minutes, order_index, video_url')
        .eq('section_type', course.section_type)
        .eq('category', course.category)
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    enabled: !!course,
  });

  // Fetch watch progress for current user (single item)
  const { data: watchProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['learn_watch_progress', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      const { data, error } = await supabase
        .from('learn_watch_progress')
        .select('*')
        .eq('learn_content_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as WatchProgress | null;
    },
    enabled: !!id && !!user?.id,
  });

  // Batch progress for all siblings
  const siblingIds = siblings?.map(s => s.id) || [];
  const { data: allProgress } = useQuery({
    queryKey: ['learn_progress_batch', user?.id, siblingIds],
    queryFn: async () => {
      if (!user?.id || siblingIds.length === 0) return [];
      const { data, error } = await supabase
        .from('learn_watch_progress')
        .select('learn_content_id, completed')
        .eq('user_id', user.id)
        .in('learn_content_id', siblingIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && siblingIds.length > 0,
  });

  // Mark as complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !id) throw new Error('Missing data');
      await supabase
        .from('learn_watch_progress')
        .upsert({
          user_id: user.id,
          learn_content_id: id,
          completed: true,
          progress_seconds: watchProgress?.progress_seconds || 0,
          total_seconds: watchProgress?.total_seconds || 0,
          last_watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,learn_content_id' });
    },
    onSuccess: () => {
      toast.success('Marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['learn_watch_progress'] });
      queryClient.invalidateQueries({ queryKey: ['learn_progress_batch'] });
    },
  });

  // Realtime progress updates
  useEffect(() => {
    if (!id || !user?.id) return;
    const channel = supabase
      .channel(`watch-progress-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learn_watch_progress',
        filter: `learn_content_id=eq.${id}`,
      }, (payload) => {
        if ((payload.new as any)?.user_id === user.id) {
          refetchProgress();
          queryClient.invalidateQueries({ queryKey: ['learn_progress_batch'] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, user?.id, refetchProgress, queryClient]);

  const isCompleted = watchProgress?.completed || false;

  const handlePlayVideo = () => {
    if (!course) return;
    if (course.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    if (!course.video_url) {
      toast.error('Video not available');
      return;
    }
    setShowPlayer(true);
  };

  const handleDownloadResource = (resource: LearnResource) => {
    if (resource.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    window.open(resource.file_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="aspect-video bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Course not found</h2>
          <Button onClick={() => navigate('/learn')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learn
          </Button>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <ContentSidebar
      items={siblings || []}
      activeId={id || ''}
      categoryName={course.category}
      progress={allProgress || []}
      className={isMobile ? 'rounded-none border-x-0' : 'lg:h-[calc(100vh-120px)] lg:sticky lg:top-[56px]'}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-2 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learn')}
            className="gap-1.5 h-8 px-2 hover:bg-card shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs">Back</span>
          </Button>
          <span className="text-xs text-foreground font-medium truncate">{course.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-4">

          {/* Left Column: Video + Tabs */}
          <div className="space-y-4">
            {/* Inline Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              {showPlayer && course.video_url ? (
                <SecureVideoPlayer
                  videoUrl={course.video_url}
                  contentId={course.id}
                  title={course.title}
                  thumbnailUrl={course.thumbnail_url}
                  videoSourceType={course.video_source_type}
                  className="aspect-video w-full"
                />
              ) : (
                <div className="relative aspect-video w-full group cursor-pointer" onClick={handlePlayVideo}>
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-card to-accent/10" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/50">
                    <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                      <Play className="h-7 w-7 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Premium badge */}
                  {course.is_premium && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Premium</span>
                    </div>
                  )}
                  {/* Duration badge */}
                  {(course.duration_minutes ?? 0) > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-white/80" />
                      <span className="text-xs font-medium text-white">{course.duration_minutes}m</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mark as Complete + Instructor */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {course.instructor_name && (
                  <>
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 shrink-0">
                      <AvatarImage src={course.instructor_avatar_url} alt={course.instructor_name} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                        {course.instructor_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground truncate block">{course.instructor_name}</span>
                      {course.company_name && (
                        <span className="text-xs text-muted-foreground">{course.company_name}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <Button
                variant={isCompleted ? 'secondary' : 'default'}
                size="sm"
                className="shrink-0 gap-1.5 rounded-full text-xs h-8"
                onClick={() => markCompleteMutation.mutate()}
                disabled={markCompleteMutation.isPending || isCompleted}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>

            {/* Mobile: Sidebar below video */}
            {isMobile && siblings && siblings.length > 1 && (
              <div className="mt-2">{sidebarContent}</div>
            )}

            {/* Tabs: Description + Resources */}
            <Tabs defaultValue="about">
              <TabsList className="bg-transparent p-0 h-auto border-b border-border/50 rounded-none w-full justify-start gap-4">
                <TabsTrigger
                  value="about"
                  className="rounded-none px-0 pb-2 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-none px-0 pb-2 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
                >
                  Resources
                  {resources && resources.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-muted rounded-full font-semibold">
                      {resources.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="pt-3">
                {course.full_description && course.full_description.trim() !== '' ? (
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {course.full_description}
                  </p>
                ) : course.description ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {course.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">No description available.</p>
                )}
              </TabsContent>

              <TabsContent value="resources" className="pt-3">
                {resources && resources.length > 0 ? (
                  <div className="grid gap-2">
                    {resources.map((resource) => (
                      <div 
                        key={resource.id}
                        className="bg-card rounded-lg p-2.5 flex items-center justify-between border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground text-xs">{resource.title}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                              <span className="uppercase font-medium px-1 py-0.5 rounded bg-muted text-[9px]">{resource.file_type}</span>
                              {resource.file_size_mb && <span>{resource.file_size_mb} MB</span>}
                              {resource.is_premium && (
                                <span className="text-primary font-medium flex items-center gap-0.5">
                                  <Sparkles className="h-2 w-2" />
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadResource(resource)}
                          className="shrink-0 gap-1 rounded-full px-2.5 h-7 text-[10px] hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        >
                          <Download className="h-3 w-3" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-lg p-5 text-center border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-xs font-semibold text-foreground mb-0.5">No resources yet</h3>
                    <p className="text-[10px] text-muted-foreground">Check back later!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Sidebar (desktop only) */}
          {!isMobile && siblings && siblings.length > 1 && (
            <div>{sidebarContent}</div>
          )}
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        title="Unlock Premium Content"
        description="This content is available to fully onboarded members. Complete your balance payment to access all exclusive videos, sessions, and resources."
      />
    </div>
  );
};

export default CourseDetail;
