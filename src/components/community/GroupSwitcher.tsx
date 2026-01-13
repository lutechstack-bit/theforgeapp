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

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-secondary/30 rounded-xl border border-border/40">
      {/* Cohort Group */}
      {cohortGroup && (
        <button
          onClick={onSelectCohort}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left",
            activeGroupType === 'cohort'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-background/50 hover:bg-background text-foreground border border-border/40"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            activeGroupType === 'cohort' 
              ? "bg-primary-foreground/20" 
              : "bg-primary/10"
          )}>
            <Users className={cn(
              "w-4 h-4",
              activeGroupType === 'cohort' ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">My Cohort</p>
            <p className={cn(
              "text-[10px] truncate",
              activeGroupType === 'cohort' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {cohortGroup.name}
            </p>
          </div>
        </button>
      )}

      {/* Divider */}
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">City</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* User's City Group or Main Group */}
      {(userCityGroup || mainGroup) && (
        <button
          onClick={() => onSelectCity((userCityGroup || mainGroup)!.id)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left",
            activeGroupType === 'city' && activeGroupId === (userCityGroup || mainGroup)?.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-background/50 hover:bg-background text-foreground border border-border/40"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            activeGroupType === 'city' && activeGroupId === (userCityGroup || mainGroup)?.id
              ? "bg-primary-foreground/20" 
              : "bg-green-500/10"
          )}>
            <MapPin className={cn(
              "w-4 h-4",
              activeGroupType === 'city' && activeGroupId === (userCityGroup || mainGroup)?.id
                ? "text-primary-foreground" 
                : "text-green-500"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {(userCityGroup || mainGroup)?.name}
            </p>
            <p className={cn(
              "text-[10px] truncate",
              activeGroupType === 'city' && activeGroupId === (userCityGroup || mainGroup)?.id
                ? "text-primary-foreground/70" 
                : "text-muted-foreground"
            )}>
              Regional community
            </p>
          </div>
        </button>
      )}
    </div>
  );
};
