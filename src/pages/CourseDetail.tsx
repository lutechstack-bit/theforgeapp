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
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  full_description?: string;
  thumbnail_url?: string;
  video_url?: string;
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
          <div className="h-64 bg-muted rounded-2xl" />
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
  ];

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learn')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Learn</span>
            <span>/</span>
            <span className="text-foreground">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left - Video/Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted group cursor-pointer" onClick={handlePlayVideo}>
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
                <Play className="h-8 w-8 text-foreground ml-1" />
              </div>
            </div>

            {/* Watch Trailer Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Button 
                variant="secondary" 
                className="rounded-full bg-white text-foreground hover:bg-white/90 shadow-lg gap-2"
              >
                <Play className="h-4 w-4" />
                Watch trailer
              </Button>
            </div>
          </div>

          {/* Right - Course Info Card */}
          <div className="glass-premium rounded-2xl p-6 h-fit space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-muted-foreground text-sm">{course.description}</p>
              )}
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              {keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handlePlayVideo}
              className="w-full rounded-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              {course.is_premium && !isFullAccess ? 'Unlock with Full Access' : 'Start Learning'}
              <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
            </Button>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
              {course.duration_minutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_minutes} min</span>
                </div>
              )}
              {course.instructor_name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{course.instructor_name}</span>
                </div>
              )}
              {course.company_name && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>{course.company_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Description, Resources, About */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="bg-card/50 p-1 rounded-full border border-border/50">
            <TabsTrigger
              value="about"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Resources
              {resources && resources.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-muted rounded-full">
                  {resources.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="glass-premium rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">{course.title}</h2>
              
              {course.full_description ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {course.full_description}
                  </p>
                </div>
              ) : course.description ? (
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description available for this course.
                </p>
              )}

              {/* Instructor Section */}
              {course.instructor_name && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Taught By
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{course.instructor_name}</p>
                      {course.company_name && (
                        <p className="text-sm text-muted-foreground">{course.company_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            {resources && resources.length > 0 ? (
              <div className="grid gap-4">
                {resources.map((resource) => (
                  <div 
                    key={resource.id}
                    className="glass-premium rounded-xl p-4 flex items-center justify-between hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="uppercase">{resource.file_type}</span>
                          {resource.file_size_mb && (
                            <>
                              <span>•</span>
                              <span>{resource.file_size_mb} MB</span>
                            </>
                          )}
                          {resource.is_premium && (
                            <>
                              <span>•</span>
                              <span className="text-primary">Premium</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadResource(resource)}
                      className="shrink-0 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-premium rounded-2xl p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No resources yet</h3>
                <p className="text-muted-foreground">
                  Resources for this course will be available soon.
                </p>
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
