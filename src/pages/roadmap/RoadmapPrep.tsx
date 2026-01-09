import React from 'react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import PrepChecklistSection from '@/components/roadmap/PrepChecklistSection';
import NightlyRitualSection from '@/components/roadmap/NightlyRitualSection';

const RoadmapPrep: React.FC = () => {
  const {
    prepItems,
    completedIds,
    togglePrepMutation,
    forgeStartDate,
    currentDayNumber,
  } = useRoadmapData();

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
