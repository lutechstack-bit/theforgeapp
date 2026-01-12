import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface LearnCourseCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  instructorName?: string;
  companyName?: string;
  companyLogoUrl?: string;
  isPremium?: boolean;
  durationMinutes?: number;
  onClick?: () => void;
}

export const LearnCourseCard: React.FC<LearnCourseCardProps> = ({
  id,
  title,
  thumbnailUrl,
  isPremium,
  durationMinutes,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/learn/${id}`);
    }
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const duration = formatDuration(durationMinutes);

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] min-w-[200px] md:min-w-[240px] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-lg">
            Premium
          </span>
        </div>
      )}

      {/* Duration Badge - positioned outside card on right */}
      {duration && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1.5 rounded-full shadow-lg border border-border/50">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{duration}</span>
          </div>
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-primary/5" />
      </div>
    </div>
  );
};
