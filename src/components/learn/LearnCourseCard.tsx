import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface LearnCourseCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  category?: string;
  instructorName?: string;
  companyName?: string;
  onClick?: () => void;
}

export const LearnCourseCard: React.FC<LearnCourseCardProps> = ({
  id,
  title,
  thumbnailUrl,
  durationMinutes,
  category,
  instructorName,
  companyName,
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
      className="group cursor-pointer w-[180px] sm:w-[200px] md:w-[220px] flex-shrink-0"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/30 group-hover:border-primary/30 transition-colors duration-300">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Duration badge */}
        {duration && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              <span className="text-[11px] font-medium">{duration}</span>
            </div>
          </div>
        )}
      </div>

      {/* Metadata below thumbnail */}
      <div className="mt-2.5 space-y-1 px-0.5">
        {category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary truncate">
            {category}
          </p>
        )}
        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
          {title}
        </h3>
        {instructorName && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-foreground/80 bg-muted/50 rounded-full px-2 py-0.5 truncate max-w-[140px]">
              {instructorName}
            </span>
          </div>
        )}
        {companyName && (
          <p className="text-[11px] text-muted-foreground truncate">
            {companyName}
          </p>
        )}
      </div>
    </div>
  );
};
