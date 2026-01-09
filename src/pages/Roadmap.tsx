import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, CohortType } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Flag, Anchor, Sparkles, Map, Image } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

// Components
import RoadmapHero from '@/components/roadmap/RoadmapHero';
import QuickActionsBar from '@/components/roadmap/QuickActionsBar';
import EnhancedRoadmapNode from '@/components/roadmap/EnhancedRoadmapNode';
import EnhancedSmoothPath from '@/components/roadmap/EnhancedSmoothPath';
import MasonryGallery from '@/components/roadmap/MasonryGallery';
import StudentFilmStrip from '@/components/roadmap/StudentFilmStrip';
import PrepChecklistSection from '@/components/roadmap/PrepChecklistSection';
import NightlyRitualSection from '@/components/roadmap/NightlyRitualSection';
import RulesAccordion from '@/components/roadmap/RulesAccordion';
import CohortCrossSell from '@/components/roadmap/CohortCrossSell';
import CohortPreviewModal from '@/components/roadmap/CohortPreviewModal';
import EquipmentSection from '@/components/roadmap/EquipmentSection';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

const cohortDisplayNames: Record<CohortType, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

const Roadmap: React.FC = () => {
  const { profile, edition, forgeMode, user } = useAuth();
  const queryClient = useQueryClient();
  const userCohortType = (edition?.cohort_type as CohortType) || 'FORGE';
  const cohortName = cohortDisplayNames[userCohortType];
  const [previewCohort, setPreviewCohort] = useState<CohortType | null>(null);
  const [activeSection, setActiveSection] = useState('journey');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch roadmap days
  const { data: roadmapDays, isLoading } = useQuery({
    queryKey: ['roadmap-days', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return [];
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .eq('edition_id', profile.edition_id)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return data as RoadmapDay[];
    },
    enabled: !!profile?.edition_id
  });

  // Fetch galleries
  const { data: galleries } = useQuery({
    queryKey: ['roadmap-galleries', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_galleries')
        .select('*')
        .eq('edition_id', profile?.edition_id || '')
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.edition_id
  });

  // Fetch student films
  const { data: studentFilms } = useQuery({
    queryKey: ['student-films', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_films')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch equipment count for current cohort
  const { data: equipmentCount } = useQuery({
    queryKey: ['equipment-count', userCohortType],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('forge_equipment')
        .select('*', { count: 'exact', head: true })
        .eq('cohort_type', userCohortType);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch prep checklist items
  const { data: prepItems } = useQuery({
    queryKey: ['prep-checklist-items', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prep_checklist_items')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's prep progress
  const { data: userProgress } = useQuery({
    queryKey: ['user-prep-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_prep_progress')
        .select('checklist_item_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const completedIds = useMemo(() => 
    new Set(userProgress?.map(p => p.checklist_item_id) || []),
    [userProgress]
  );

  // Toggle prep item completion
  const togglePrepMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (completed) {
        await supabase.from('user_prep_progress').insert({
          user_id: user.id,
          checklist_item_id: itemId
        });
      } else {
        await supabase.from('user_prep_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('checklist_item_id', itemId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
    }
  });

  const forgeStartDate = edition?.forge_start_date ? new Date(edition.forge_start_date) : null;

  const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!day.is_active) return 'locked';
    if (!day.date) {
      const activeDays = roadmapDays?.filter(d => d.is_active) || [];
      if (activeDays[0]?.id === day.id) return 'current';
      return 'upcoming';
    }
    const today = new Date();
    const dayDate = new Date(day.date);
    if (dayDate < today) return 'completed';
    if (dayDate.toDateString() === today.toDateString()) return 'current';
    return 'upcoming';
  };

  const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
    const row = index % 3;
    if (row === 0) return 'left';
    if (row === 1) return 'center';
    return 'right';
  };

  // Calculate current day number (for nightly ritual)
  const currentDayNumber = useMemo(() => {
    const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current');
    return currentDay?.day_number || 1;
  }, [roadmapDays]);

  const completedCount = roadmapDays?.filter(d => getDayStatus(d) === 'completed').length || 0;
  const totalCount = roadmapDays?.length || 0;
  const nodeStatuses = useMemo(() => roadmapDays?.map(getDayStatus) || [], [roadmapDays]);

  // Separate galleries by type
  const stayGallery = galleries?.filter(g => g.gallery_type === 'stay_location') || [];
  const momentsGallery = galleries?.filter(g => g.gallery_type === 'forge_moment') || [];

  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) setContainerWidth(timelineRef.current.offsetWidth);
    };
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startThreshold = windowHeight * 0.8;
      const endThreshold = windowHeight * 0.2;
      const totalScrollableDistance = rect.height + (startThreshold - endThreshold);
      const scrolled = startThreshold - rect.top;
      setScrollProgress(Math.max(0, Math.min(1, scrolled / totalScrollableDistance)));
    };
    updateWidth();
    setTimeout(handleScroll, 100);
    window.addEventListener('resize', updateWidth);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [roadmapDays]);

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!profile?.edition_id) {
    return (
      <div className="container py-6">
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Anchor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Edition Assigned</h2>
          <p className="text-muted-foreground">Please contact the team.</p>
        </div>
      </div>
    );
  }

  if (!roadmapDays || roadmapDays.length === 0) {
    return (
      <div className="container py-6">
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">The roadmap is coming soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 pb-24">
      <div className="flex gap-6 max-w-5xl mx-auto">
        <div className="flex-1 max-w-2xl">
          {/* Hero */}
          <RoadmapHero
            cohortName={cohortName}
            forgeMode={forgeMode}
            forgeStartDate={forgeStartDate}
            completedCount={completedCount}
            totalCount={totalCount}
          />

          {/* Quick Actions */}
          <QuickActionsBar
            activeSection={activeSection}
            onSectionClick={setActiveSection}
            hasGallery={stayGallery.length > 0 || momentsGallery.length > 0}
            hasFilms={(studentFilms?.length || 0) > 0}
            hasEquipment={(equipmentCount || 0) > 0}
          />

          {/* Equipment Section */}
          <EquipmentSection cohortType={userCohortType} />

          {/* Stay Gallery */}
          {stayGallery.length > 0 && (
            <div id="roadmap-gallery">
              <MasonryGallery
                images={stayGallery}
                title="Where You'll Create"
                subtitle="Your Forge home base"
              />
            </div>
          )}

          {/* Journey Map */}
          <section id="roadmap-journey" className="py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Journey</h2>
                <p className="text-sm text-muted-foreground">Day by day through the Forge</p>
              </div>
            </div>

            <div ref={timelineRef} className="relative" style={{ minHeight: (totalCount - 1) * 160 + 140 }}>
              <EnhancedSmoothPath
                nodeCount={totalCount}
                getNodePosition={getNodePosition}
                nodeStatuses={nodeStatuses}
                containerWidth={containerWidth}
                scrollProgress={scrollProgress}
              />
              <div className="relative z-10 space-y-16 py-8 px-2">
                {roadmapDays.map((day, index) => (
                  <div key={day.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
                    <EnhancedRoadmapNode
                      day={{
                        id: day.id,
                        day_number: day.day_number,
                        title: day.title,
                        description: day.description,
                        date: day.date,
                        location: day.location,
                        call_time: day.call_time,
                        checklist: (day.checklist as string[]) || [],
                        mentors: (day.mentors as string[]) || [],
                        key_learnings: (day.key_learnings as string[]) || [],
                        activity_type: day.activity_type,
                        duration_hours: day.duration_hours ? Number(day.duration_hours) : undefined,
                        intensity_level: day.intensity_level,
                        teaser_text: day.teaser_text,
                        reveal_days_before: day.reveal_days_before,
                        theme_name: day.theme_name,
                        objective: day.objective,
                        schedule: Array.isArray(day.schedule) ? day.schedule as { time: string; activity: string; icon?: string }[] : [],
                        location_image_url: (day as any).location_image_url,
                        milestone_type: (day as any).milestone_type,
                      }}
                      status={getDayStatus(day)}
                      position={getNodePosition(index)}
                      isFirst={index === 0}
                      isLast={index === roadmapDays.length - 1}
                      forgeMode={forgeMode}
                      forgeStartDate={forgeStartDate}
                      cohortType={userCohortType}
                    />
                  </div>
                ))}
              </div>
              <div className="relative flex justify-center mt-6 pt-6">
                <div className="glass-premium rounded-2xl p-4 flex items-center gap-3 shadow-glow">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Flag className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-bold text-foreground text-sm">{cohortName} Complete</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Prep Checklist */}
          <div id="roadmap-prep">
            <PrepChecklistSection
              items={prepItems || []}
              completedIds={completedIds}
              onToggle={(itemId, completed) => togglePrepMutation.mutate({ itemId, completed })}
              forgeStartDate={forgeStartDate}
            />
          </div>

          {/* Nightly Ritual */}
          <NightlyRitualSection currentDayNumber={currentDayNumber} />

          {/* Forge Moments Gallery */}
          {momentsGallery.length > 0 && (
            <MasonryGallery
              images={momentsGallery}
              title="Past Forge Magic"
              subtitle="Moments from previous editions"
            />
          )}

          {/* Student Films */}
          {studentFilms && studentFilms.length > 0 && (
            <div id="roadmap-films">
              <StudentFilmStrip 
                films={studentFilms.map(f => ({
                  ...f,
                  award_tags: Array.isArray(f.award_tags) ? f.award_tags as string[] : []
                }))} 
                title="Best Student Work" 
                subtitle="Top films from past Forge editions" 
              />
            </div>
          )}

          {/* Rules */}
          <RulesAccordion />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <CohortCrossSell currentCohort={userCohortType} onCohortClick={(cohort) => setPreviewCohort(cohort)} />
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-12 max-w-2xl mx-auto">
        <CohortCrossSell currentCohort={userCohortType} onCohortClick={(cohort) => setPreviewCohort(cohort)} />
      </div>

      <CohortPreviewModal isOpen={!!previewCohort} onClose={() => setPreviewCohort(null)} cohortType={previewCohort} />
    </div>
  );
};

export default Roadmap;
