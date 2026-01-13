import React from 'react';
import { Users, Briefcase, MessageSquare, FolderOpen } from 'lucide-react';

interface QuickStatsRowProps {
  editionName?: string;
  city?: string;
  skillsCount: number;
  messageCount: number;
  worksCount: number;
}

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({
  editionName,
  city,
  skillsCount,
  messageCount,
  worksCount,
}) => {
  const stats = [
    {
      icon: Users,
      label: 'Cohort',
      value: editionName || 'Not Assigned',
      subtext: city,
    },
    {
      icon: Briefcase,
      label: 'Skills',
      value: skillsCount.toString(),
      subtext: 'proficiencies',
    },
    {
      icon: MessageSquare,
      label: 'Community',
      value: messageCount.toString(),
      subtext: 'posts',
    },
    {
      icon: FolderOpen,
      label: 'Projects',
      value: worksCount.toString(),
      subtext: 'works',
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-shrink-0 glass-card rounded-xl p-4 min-w-[140px] sm:flex-1"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
          <div className="text-lg font-bold text-foreground truncate">
            {stat.value}
          </div>
          {stat.subtext && (
            <div className="text-xs text-muted-foreground truncate">
              {stat.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
