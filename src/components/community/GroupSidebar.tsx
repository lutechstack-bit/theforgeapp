import React from 'react';
import { cn } from '@/lib/utils';
import { Users, MapPin, Crown } from 'lucide-react';

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface GroupSidebarProps {
  groups: CityGroup[];
  activeGroupId: string | null;
  userCityGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  memberCounts?: Record<string, number>;
}

export const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  activeGroupId,
  userCityGroupId,
  onSelectGroup,
  memberCounts = {},
}) => {
  const mainGroup = groups.find(g => g.is_main);
  const cityGroups = groups.filter(g => !g.is_main && (g.id === userCityGroupId));

  return (
    <div className="flex flex-col gap-3">
      {/* Main Group - All Forge */}
      {mainGroup && (
        <button
          onClick={() => onSelectGroup(mainGroup.id)}
          className={cn(
            "relative overflow-hidden rounded-2xl p-4 transition-all duration-200",
            "border-2",
            activeGroupId === mainGroup.id
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary to-primary/60"
            )}>
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{mainGroup.name}</span>
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                Everyone in Forge
              </span>
            </div>
          </div>
          {activeGroupId === mainGroup.id && (
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          )}
        </button>
      )}

      {/* User's City Group */}
      {cityGroups.map((group) => (
        <button
          key={group.id}
          onClick={() => onSelectGroup(group.id)}
          className={cn(
            "relative overflow-hidden rounded-2xl p-4 transition-all duration-200",
            "border-2",
            activeGroupId === group.id
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-secondary to-secondary/60"
            )}>
              <MapPin className="h-6 w-6 text-foreground" />
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-foreground block">{group.name}</span>
              <span className="text-xs text-muted-foreground">
                Your local community
              </span>
            </div>
          </div>
          {activeGroupId === group.id && (
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          )}
        </button>
      ))}

      {/* Empty State if no city group */}
      {cityGroups.length === 0 && (
        <div className="rounded-2xl p-4 border-2 border-dashed border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-left">
              <span className="font-medium text-muted-foreground block">No City Group</span>
              <span className="text-xs text-muted-foreground">
                Update your profile to join
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
