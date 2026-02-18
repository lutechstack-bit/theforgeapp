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
  cardLayout?: 'portrait' | 'landscape';
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
  cardLayout = 'portrait',
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

  if (cardLayout === 'landscape') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer w-[320px] sm:w-[360px] flex-shrink-0"
      >
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/30 group-hover:border-primary/30 transition-colors duration-300">
          {/* Background image */}
          <img
            src={thumbnailUrl || '/images/learn/pre-forge-placeholder.png'}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Warm golden gradient overlay from left */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(245,230,200,0.88) 0%, rgba(245,230,200,0.7) 50%, rgba(245,230,200,0.15) 100%)',
            }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* Top-left label */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-semibold tracking-wide uppercase text-black/70">
                Pre-Forge Session
              </span>
            </div>

            {/* Title - center left */}
            <div className="flex-1 flex items-center">
              <h3 className="text-xl sm:text-2xl font-black text-black leading-tight line-clamp-3 max-w-[75%]">
                {title}
              </h3>
            </div>

            {/* Bottom-left instructor */}
            <div>
              {instructorName && (
                <p className="text-sm font-bold text-black">{instructorName}</p>
              )}
              {companyName && (
                <p className="text-xs text-black/60">{companyName}</p>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </div>
    );
  }

  // Portrait layout (default)
  const duration = formatDuration(durationMinutes);

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0"
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
    </div>
  );
};
