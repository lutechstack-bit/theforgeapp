import React from 'react';
import { Play, Lock } from 'lucide-react';
import { VideoProgressBar } from './VideoProgressBar';

interface CourseCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructorName?: string;
  companyName?: string;
  durationMinutes?: number;
  isPremium?: boolean;
  isLocked?: boolean;
  progressPercent?: number;
  isCompleted?: boolean;
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  thumbnailUrl,
  instructorName,
  companyName,
  durationMinutes,
  isPremium = false,
  isLocked = false,
  progressPercent = 0,
  isCompleted = false,
  onClick,
}) => {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px] cursor-pointer"
    >
      {/* Card Container - Tall aspect ratio like reference */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border/30 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
        {/* Thumbnail Image */}
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-card flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient Overlay - Stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Duration Badge - Top Right */}
        {durationMinutes && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs font-medium text-white">
            {formatDuration(durationMinutes)}
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {/* Play Button on Hover */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Bottom Content - Title and Instructor */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Title - Two lines with emphasis */}
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>

          {/* Instructor Badge - Pill style like reference */}
          {instructorName && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-sm font-medium text-white">{instructorName}</span>
              {companyName && (
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded text-white/90 font-medium">
                  {companyName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progressPercent > 0 && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0">
            <VideoProgressBar progress={progressPercent} />
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-md text-xs font-semibold text-white">
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
};
