import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoProgressBar } from './VideoProgressBar';

interface PremiumVideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  instructorName?: string;
  instructorAvatar?: string;
  companyName?: string;
  durationMinutes?: number;
  isPremium?: boolean;
  progressPercent?: number;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PremiumVideoCard: React.FC<PremiumVideoCardProps> = ({
  id,
  title,
  thumbnailUrl,
  instructorName,
  instructorAvatar,
  companyName,
  durationMinutes,
  isPremium,
  progressPercent = 0,
  isCompleted = false,
  onClick,
  className,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/learn/${id}`);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer rounded-2xl transition-all duration-300",
        "bg-card border border-border/50 hover-gold-glow",
        className
      )}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted/50 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        {(durationMinutes ?? 0) > 0 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatDuration(durationMinutes)}
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-green-500/90 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        )}

        {/* Premium Badge */}
        {isPremium && !isCompleted && (
          <div className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full">
            Premium
          </div>
        )}

        {/* Progress Bar */}
        <VideoProgressBar progress={progressPercent} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h4>

        {/* Instructor Info */}
        {instructorName && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-border/50">
              <AvatarImage src={instructorAvatar} alt={instructorName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {instructorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">
                {instructorName}
              </p>
              {companyName && (
                <p className="text-xs text-muted-foreground truncate">
                  {companyName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Progress Text */}
        {progressPercent > 0 && !isCompleted && (
          <p className="text-xs text-muted-foreground">
            {progressPercent}% complete
          </p>
        )}
      </div>
    </div>
  );
};
