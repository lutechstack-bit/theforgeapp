import React from 'react';
import { Users, MapPin, Wifi, Film } from 'lucide-react';

interface CommunityStatsBarProps {
  totalMembers: number;
  totalCities: number;
  onlineNow: number;
  totalFilms: number;
}

export const CommunityStatsBar: React.FC<CommunityStatsBarProps> = ({
  totalMembers,
  totalCities,
  onlineNow,
  totalFilms,
}) => {
  const stats = [
    { icon: Users, label: 'Members', value: totalMembers },
    { icon: MapPin, label: 'Cities', value: totalCities },
    { icon: Wifi, label: 'Online', value: onlineNow },
    { icon: Film, label: 'Films', value: totalFilms },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 shrink-0"
        >
          <stat.icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{stat.value}</span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
