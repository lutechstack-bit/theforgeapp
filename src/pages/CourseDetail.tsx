import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayerModal } from '@/components/learn/VideoPlayerModal';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  User, 
  FileText, 
  Download,
  BookOpen,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  full_description?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_source_type?: 'upload' | 'embed';
  instructor_name?: string;
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

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFullAccess } = useAuth();
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
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

  const handlePlayVideo = () => {
    if (!course) return;
    
    if (course.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }

    if (!course.video_url) {
      toast.error('Video not available for this course');
      return;
    }

    setShowVideoPlayer(true);
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-[500px] bg-muted rounded-2xl" />
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

  // No hardcoded features - removed to keep layout compact

  return (
    <div className="min-h-screen bg-background">
      {/* Ultra-Compact Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-2 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learn')}
            className="gap-1.5 h-8 px-2 hover:bg-card"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-xs">Back</span>
          </Button>
          
          <span className="text-xs text-foreground font-medium truncate max-w-[180px]">{course.title}</span>
        </div>
      </div>

      {/* Full-Width Hero Card */}
      <div className="container py-4">
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            
            {/* Left - Portrait Thumbnail */}
            <div className="relative group shrink-0 md:w-[280px] lg:w-[320px]">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-card to-accent/10" />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Premium badge */}
                {course.is_premium && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-white uppercase tracking-wide">Premium</span>
                  </div>
                )}
                
                {/* Play Button - Centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={handlePlayVideo}
                    className="rounded-full bg-white/95 text-gray-900 hover:bg-white shadow-2xl gap-2 px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
                      <Play className="h-3.5 w-3.5 text-white ml-0.5" fill="white" />
                    </div>
                    Play
                  </Button>
                </div>

                {/* Duration badge at bottom */}
                {course.duration_minutes && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-white/80" />
                    <span className="text-xs font-medium text-white">{course.duration_minutes}m</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right - Info Section */}
            <div className="flex-1 p-4 md:p-5 lg:p-6 flex flex-col">
              {/* Premium Badge */}
              {course.is_premium && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 w-fit mb-2">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">Premium</span>
                </div>
              )}

              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 leading-tight">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              )}

              {/* Instructor */}
              {course.instructor_name && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center ring-1 ring-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{course.instructor_name}</span>
                    {course.company_name && (
                      <span className="text-xs text-muted-foreground ml-1.5">• {course.company_name}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA Button */}
              <Button 
                onClick={handlePlayVideo}
                className="w-full rounded-full h-11 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 group mb-4"
              >
                {course.is_premium && !isFullAccess ? 'Unlock Access' : 'Start Learning'}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              {/* Stats Row */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{course.duration_minutes || '30'} min</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>Self-Paced</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>Certificate</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="container py-3 lg:py-4">

        {/* Ultra-Compact Tabs */}
        <Tabs defaultValue="about" className="space-y-2">
          <TabsList className="bg-card p-0.5 rounded-full border border-border/50 h-8">
            <TabsTrigger
              value="about"
              className="rounded-full px-3 lg:px-4 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-7"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-full px-3 lg:px-4 py-1 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-7"
            >
              Resources
              {resources && resources.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-muted rounded-full font-semibold">
                  {resources.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-2">
            {/* Course Overview - Only show if has full_description */}
            {course.full_description && course.full_description.trim() !== '' && (
              <div className="bg-card rounded-lg p-3 lg:p-4 border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Overview</h3>
                <p className="text-muted-foreground text-xs leading-snug whitespace-pre-wrap">
                  {course.full_description}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-2">
            {resources && resources.length > 0 ? (
              <div className="grid gap-2">
                {resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="bg-card rounded-lg p-2.5 lg:p-3 flex items-center justify-between border border-border/50 hover:border-primary/30 transition-all group"
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

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoPlayer}
        onOpenChange={setShowVideoPlayer}
        content={course ? {
          id: course.id,
          title: course.title,
          video_url: course.video_url || '',
          video_source_type: course.video_source_type,
          thumbnail_url: course.thumbnail_url,
          instructor_name: course.instructor_name,
          company_name: course.company_name,
          full_description: course.full_description,
          duration_minutes: course.duration_minutes,
        } : null}
        resources={resources}
      />

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
