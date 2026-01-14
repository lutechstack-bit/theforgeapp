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
  Building2, 
  FileText, 
  Download,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Award,
  Sparkles,
  GraduationCap
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

  // Parse key features from course data
  const keyFeatures = [
    'Self paced recorded course',
    'Peer group via community',
    'Access exclusive resources',
    'Certificate of completion',
  ];

  // Generate tile positions for visual interest
  const tileTransforms = [
    'rotate-[-2deg] translate-y-2',
    'rotate-[1deg] -translate-y-1',
    'rotate-[-1deg] translate-y-3',
    'rotate-[2deg] -translate-y-2',
    'rotate-[-1.5deg] translate-y-1',
    'rotate-[1.5deg] -translate-y-3',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learn')}
            className="gap-2 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <span className="text-sm text-foreground font-medium truncate max-w-[200px]">{course.title}</span>
        </div>
      </div>

      {/* Compact Hero Section */}
      <div className="relative overflow-hidden">
        {/* Single subtle gradient orb */}
        <div className="absolute -top-20 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container relative py-4 lg:py-6">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5 lg:gap-8 items-start">
            
            {/* Left - Thumbnail */}
            <div className="relative group">
              <div className="relative aspect-video rounded-xl lg:rounded-2xl overflow-hidden shadow-xl border border-border/30 group-hover:border-primary/30 transition-all duration-300">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Premium badge */}
                {course.is_premium && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-white uppercase">Premium</span>
                  </div>
                )}
                
                {/* Duration badge */}
                {course.duration_minutes && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-white/80" />
                    <span className="text-xs font-medium text-white">{course.duration_minutes}m</span>
                  </div>
                )}
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={handlePlayVideo}
                    className="rounded-full bg-white/95 text-gray-900 hover:bg-white shadow-xl gap-2 px-5 py-4 text-sm font-semibold transition-all hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                    </div>
                    Start Course
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right - Compact Info Card */}
            <div className="lg:sticky lg:top-20">
              <div className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-lg border border-border/50">
                {/* Premium Badge */}
                {course.is_premium && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Premium</span>
                  </div>
                )}

                <h1 className="text-lg lg:text-xl font-bold text-foreground mb-2 leading-tight">
                  {course.title}
                </h1>
                
                {course.description && (
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Compact Features */}
                <div className="space-y-2 mb-4">
                  {keyFeatures.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handlePlayVideo}
                  className="w-full rounded-full h-11 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 group"
                >
                  {course.is_premium && !isFullAccess ? 'Unlock Access' : 'Start Learning'}
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>

                {/* Compact Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold text-foreground">{course.duration_minutes || '30'}m</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold text-foreground">Self-Paced</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <Award className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold text-foreground">Certificate</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="container py-4 lg:py-6">

        {/* Compact Instructor Section */}
        {course.instructor_name && (
          <div className="mb-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center ring-2 ring-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Taught by</p>
                <p className="text-sm font-semibold text-foreground">{course.instructor_name}</p>
                {course.company_name && (
                  <p className="text-xs text-muted-foreground">{course.company_name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compact Tabs */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList className="bg-card p-1 rounded-full border border-border/50">
            <TabsTrigger
              value="about"
              className="rounded-full px-4 lg:px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-full px-4 lg:px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Resources
              {resources && resources.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-muted rounded-full font-semibold">
                  {resources.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            {/* Course Overview - Only show if has full_description */}
            {(course.full_description || course.description) && (
              <div className="bg-card rounded-xl p-4 lg:p-5 border border-border/50">
                <h3 className="text-base font-semibold text-foreground mb-3">Course Overview</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {course.full_description || course.description}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-3">
            {resources && resources.length > 0 ? (
              <div className="grid gap-3">
                {resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="bg-card rounded-xl p-3 lg:p-4 flex items-center justify-between border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{resource.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className="uppercase font-medium px-1.5 py-0.5 rounded bg-muted text-[10px]">{resource.file_type}</span>
                          {resource.file_size_mb && <span>{resource.file_size_mb} MB</span>}
                          {resource.is_premium && (
                            <span className="text-primary font-medium flex items-center gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" />
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
                      className="shrink-0 gap-1.5 rounded-full px-3 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 text-center border border-border/50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No resources yet</h3>
                <p className="text-xs text-muted-foreground">Check back later!</p>
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
