import React from 'react';
import { cn } from '@/lib/utils';

interface MentorCardProps {
  name: string;
  specialty: string;
  avatarUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  name,
  specialty,
  avatarUrl,
  onClick,
  className,
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        "min-w-[140px] sm:min-w-[160px] p-4 bg-card rounded-xl border border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-200 flex flex-col items-center text-center flex-shrink-0",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-primary">{initials}</span>
        )}
      </div>
      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{name}</h4>
      <p className="text-xs text-muted-foreground mt-1">{specialty}</p>
    </div>
  );
};
