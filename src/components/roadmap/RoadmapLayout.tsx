import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, Anchor, Sparkles } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import RoadmapHero from '@/components/roadmap/RoadmapHero';
import QuickActionsBar from '@/components/roadmap/QuickActionsBar';
import CohortCrossSell from '@/components/roadmap/CohortCrossSell';
import CohortPreviewModal from '@/components/roadmap/CohortPreviewModal';
import { CohortType } from '@/contexts/ThemeContext';

const RoadmapLayout: React.FC = () => {
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

  const [previewCohort, setPreviewCohort] = useState<CohortType | null>(null);

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
            hasGallery={stayGallery.length > 0 || momentsGallery.length > 0}
            hasFilms={(studentFilms?.length || 0) > 0}
            hasEquipment={true}
          />

          {/* Page Content */}
          <Outlet />
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

export default RoadmapLayout;
