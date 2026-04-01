import React from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PremiumVideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructorName?: string;
  durationMinutes?: number;
  progressPercent: number;
  isCompleted: boolean;
  onClick?: () => void;
}

export const PremiumVideoCard: React.FC<PremiumVideoCardProps> = ({
  title,
  thumbnailUrl,
  instructorName,
  durationMinutes,
  progressPercent,
  isCompleted,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/30 bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
        {/* Progress bar at bottom */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progressPercent} className="h-1 rounded-none" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h4 className="text-sm font-semibold text-foreground line-clamp-2">{title}</h4>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {instructorName && <span>{instructorName}</span>}
          {durationMinutes && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {durationMinutes}m
            </span>
          )}
        </div>
        {isCompleted && (
          <span className="text-[10px] font-medium text-emerald-500">✓ Completed</span>
        )}
      </div>
    </button>
  );
};
