import React from 'react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import EquipmentSection from '@/components/roadmap/EquipmentSection';

const RoadmapEquipment: React.FC = () => {
  const { userCohortType } = useRoadmapData();

  return (
    <div className="py-4">
      <EquipmentSection cohortType={userCohortType} />
    </div>
  );
};

export default RoadmapEquipment;
