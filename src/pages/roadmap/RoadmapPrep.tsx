import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import PrepChecklistSection from '@/components/roadmap/PrepChecklistSection';
import NightlyRitualSection from '@/components/roadmap/NightlyRitualSection';

const RoadmapPrep: React.FC = () => {
  const location = useLocation();
  const {
    prepItems,
    completedIds,
    togglePrepMutation,
    forgeStartDate,
    currentDayNumber,
  } = useRoadmapData();

  // Auto-scroll to section based on URL hash
  useEffect(() => {
    const hash = location.hash.slice(1); // Remove '#'
    if (hash) {
      // Wait for DOM to render
      const timer = setTimeout(() => {
        const element = document.getElementById(`prep-${hash}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-pulse');
          setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="py-4 space-y-8">
      <PrepChecklistSection
        items={prepItems || []}
        completedIds={completedIds}
        onToggle={(itemId, completed) => togglePrepMutation.mutate({ itemId, completed })}
        forgeStartDate={forgeStartDate}
      />
      
      <NightlyRitualSection currentDayNumber={currentDayNumber} />
    </div>
  );
};

export default RoadmapPrep;
