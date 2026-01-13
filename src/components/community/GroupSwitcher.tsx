import React from 'react';
import { Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CohortGroup {
  id: string;
  edition_id: string;
  name: string;
}

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface GroupSwitcherProps {
  cohortGroup: CohortGroup | null;
  cityGroups: CityGroup[];
  userCityGroupId: string | null;
  activeGroupType: 'cohort' | 'city';
  activeGroupId: string | null;
  onSelectCohort: () => void;
  onSelectCity: (groupId: string) => void;
}

export const GroupSwitcher: React.FC<GroupSwitcherProps> = ({
  cohortGroup,
  cityGroups,
  userCityGroupId,
  activeGroupType,
  activeGroupId,
  onSelectCohort,
  onSelectCity,
}) => {
  const userCityGroup = cityGroups.find(g => g.id === userCityGroupId);
  const mainGroup = cityGroups.find(g => g.is_main);
  const displayCityGroup = userCityGroup || mainGroup;

  return (
    <div className="flex items-center gap-2 p-1.5 bg-secondary/40 rounded-full border border-border/40 w-fit">
      {/* Cohort Tab */}
      {cohortGroup && (
        <button
          onClick={onSelectCohort}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
            activeGroupType === 'cohort'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Users className="w-4 h-4" />
          <span>My Cohort</span>
        </button>
      )}

      {/* City Tab */}
      {displayCityGroup && (
        <button
          onClick={() => onSelectCity(displayCityGroup.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
            activeGroupType === 'city' && activeGroupId === displayCityGroup.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <MapPin className="w-4 h-4" />
          <span>{displayCityGroup.name}</span>
        </button>
      )}
    </div>
  );
};
