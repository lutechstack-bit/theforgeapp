import React from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, Anchor, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import RoadmapHero from '@/components/roadmap/RoadmapHero';
import QuickActionsBar from '@/components/roadmap/QuickActionsBar';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';
import FloatingHighlightsButton from '@/components/roadmap/FloatingHighlightsButton';
import AdminTestingPanel from '@/components/admin/AdminTestingPanel';

const RoadmapLayout: React.FC = () => {
  const { isAdmin } = useAdminCheck();
  const {
    profile,
    cohortName,
    forgeMode,
    forgeStartDate,
    completedCount,
    totalCount,
    isLoadingDays,
    roadmapDays,
    stayGallery,
    momentsGallery,
    studentFilms,
    userCohortType,
  } = useRoadmapData();

  // Data-driven equipment visibility - only show if equipment exists for this cohort
  const { data: equipmentCount } = useQuery({
    queryKey: ['equipment-count', userCohortType],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('forge_equipment')
        .select('*', { count: 'exact', head: true })
        .eq('cohort_type', userCohortType)
        .eq('is_active', true);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!userCohortType
  });

  const showEquipment = (equipmentCount || 0) > 0;

  if (isLoadingDays) {
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
    <div className="container px-3 sm:px-4 md:px-6 py-4 md:py-6 pb-24">
      <div className="flex gap-4 md:gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Hero */}
          <RoadmapHero
            cohortName={cohortName}
            forgeMode={forgeMode}
            forgeStartDate={forgeStartDate}
            completedCount={completedCount}
            totalCount={totalCount}
          />

          {/* Quick Actions - Clean navigation tabs */}
          <QuickActionsBar
            hasGallery={stayGallery.length > 0 || momentsGallery.length > 0}
            hasFilms={(studentFilms?.length || 0) > 0}
            hasEquipment={showEquipment}
          />

          {/* Page Content */}
          <Outlet />
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <RoadmapSidebar editionId={profile.edition_id} />
          </div>
        </div>
      </div>

      {/* Floating Highlights Button - Mobile/Tablet only */}
      <FloatingHighlightsButton editionId={profile.edition_id} />
      
      {/* Admin Testing Panel - Admin only */}
      {isAdmin && <AdminTestingPanel />}
    </div>
  );
};

export default RoadmapLayout;
