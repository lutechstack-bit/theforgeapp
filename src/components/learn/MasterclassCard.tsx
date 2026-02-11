import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MasterclassCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructorName?: string;
  description?: string;
  durationMinutes?: number;
  badge?: string;
  onClick?: () => void;
}

export const MasterclassCard: React.FC<MasterclassCardProps> = ({
  id,
  title,
  thumbnailUrl,
  instructorName,
  description,
  durationMinutes,
  badge,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/learn/${id}`);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-[260px] sm:w-[280px] flex-shrink-0 bg-card rounded-2xl border border-border/30 overflow-hidden hover:border-primary/30 transition-colors duration-300 group">
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={instructorName || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
              {badge}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5 -mt-4 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
          TEACHES FILMMAKING
        </p>
        <h3 className="text-lg font-bold text-foreground leading-tight">
          {instructorName || title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {durationMinutes && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Play className="w-3 h-3 fill-current" />
            <span>{formatDuration(durationMinutes)}</span>
          </div>
        )}

        <Button
          onClick={handleClick}
          className="w-full h-10 mt-1 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-1"
        >
          Start Learning
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
