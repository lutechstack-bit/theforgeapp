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
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learn')}
            className="gap-2 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Learn</span>
            <span className="text-primary">/</span>
            <span className="text-foreground font-medium">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Immersive Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start">
            
            {/* Left - Premium Featured Thumbnail */}
            <div className="relative group">
              {/* Decorative glow behind thumbnail */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              {/* Main Thumbnail Container */}
              <div className="relative aspect-video rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-primary/30 transition-all duration-500">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 via-card to-accent/20" />
                )}
                
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Premium corner accent */}
                <div className="absolute top-4 left-4">
                  {course.is_premium && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-white">Premium</span>
                    </div>
                  )}
                </div>
                
                {/* Duration badge */}
                {course.duration_minutes && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                    <Clock className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-xs font-medium text-white">{course.duration_minutes} min</span>
                  </div>
                )}
                
                {/* Centered Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={handlePlayVideo}
                    className="rounded-full bg-white/95 text-gray-900 hover:bg-white shadow-2xl gap-3 px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 opacity-90 group-hover:opacity-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                    </div>
                    Start Course
                  </Button>
                </div>
              </div>
              
              {/* Subtle reflection effect */}
              <div className="absolute -bottom-6 left-6 right-6 h-6 bg-gradient-to-b from-primary/10 to-transparent rounded-b-3xl blur-sm opacity-40" />
            </div>
            
            {/* Right - Floating Premium Info Card */}
            <div className="lg:sticky lg:top-24 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl border border-border/50 hover:shadow-[0_30px_80px_rgba(0,0,0,0.3)] transition-all duration-500">
                {/* Premium Badge */}
                {course.is_premium && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Premium Course</span>
                  </div>
                )}

                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {course.title}
                </h1>
                
                {course.description && (
                  <p className="text-muted-foreground text-sm lg:text-base mb-6 leading-relaxed">
                    {course.description}
                  </p>
                )}

                {/* Key Features */}
                <div className="space-y-4 mb-8">
                  {keyFeatures.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${300 + index * 100}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm lg:text-base text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handlePlayVideo}
                  className="w-full rounded-full h-14 text-base lg:text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg transition-all duration-300 hover:shadow-xl group"
                >
                  {course.is_premium && !isFullAccess ? 'Unlock with Full Access' : 'Enrol with full membership'}
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>

                {/* Course Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border/50">
                  <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-sm font-bold text-foreground">{course.duration_minutes || '30'} min</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-sm font-bold text-foreground">Self-Paced</p>
                    <p className="text-xs text-muted-foreground">Format</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <Award className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-sm font-bold text-foreground">Certificate</p>
                    <p className="text-xs text-muted-foreground">Included</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="container py-12 lg:py-16">
        {/* Large Course Title */}
        <div className="max-w-4xl mb-10">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight">
            {course.title}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {course.full_description || course.description || 'Unlock your potential with this comprehensive course designed to take your skills to the next level.'}
          </p>
        </div>

        {/* Taught By Section */}
        {course.instructor_name && (
          <div className="max-w-4xl mb-12 pt-8 border-t border-border/30">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Taught By
            </h3>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center ring-4 ring-primary/10 shadow-lg">
                <User className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-foreground">{course.instructor_name}</p>
                {course.company_name && (
                  <p className="text-muted-foreground text-base lg:text-lg">{course.company_name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Resources */}
        <Tabs defaultValue="about" className="space-y-8">
          <TabsList className="bg-card p-1.5 rounded-full border border-border/50 shadow-sm">
            <TabsTrigger
              value="about"
              className="rounded-full px-6 lg:px-8 py-2.5 text-sm lg:text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-full px-6 lg:px-8 py-2.5 text-sm lg:text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Resources
              {resources && resources.length > 0 && (
                <span className="ml-2 px-2.5 py-0.5 text-xs bg-muted rounded-full font-semibold">
                  {resources.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-8">
            {/* What You'll Learn */}
            <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-10 border border-border/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground">What You'll Learn</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Master the fundamentals and advanced concepts',
                  'Build real-world projects with practical exercises',
                  'Learn industry best practices and workflows',
                  'Get personalized feedback from experts',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description Card */}
            <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-10 border border-border/50 shadow-lg">
              <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-6">Course Overview</h3>
              
              {course.full_description ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                    {course.full_description}
                  </p>
                </div>
              ) : course.description ? (
                <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                  {course.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description available for this course.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            {resources && resources.length > 0 ? (
              <div className="grid gap-4">
                {resources.map((resource, index) => (
                  <div 
                    key={resource.id}
                    className="bg-card rounded-2xl p-5 lg:p-6 flex items-center justify-between border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 lg:gap-5">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-6 w-6 lg:h-7 lg:w-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-base lg:text-lg">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="uppercase font-medium px-2 py-0.5 rounded bg-muted">{resource.file_type}</span>
                          {resource.file_size_mb && (
                            <span>{resource.file_size_mb} MB</span>
                          )}
                          {resource.is_premium && (
                            <span className="text-primary font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadResource(resource)}
                      className="shrink-0 gap-2 rounded-full px-5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl lg:rounded-3xl p-10 lg:p-16 text-center border border-border/50">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No resources yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Resources for this course will be available soon. Check back later!
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
