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
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
        <div onClick={handleClick} className="group cursor-pointer w-full flex-shrink-0">
          <div className="relative aspect-[16/10] rounded-[13px] overflow-hidden transition-colors duration-300">
            <img
              src={thumbnailUrl || '/images/learn/pre-forge-placeholder.png'}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        </div>
      </div>
    );
  }

  // Portrait layout (default)
  const duration = formatDuration(durationMinutes);

  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0">
    <div
      onClick={handleClick}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] rounded-[13px] overflow-hidden transition-colors duration-300">
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
    </div>
  );
};
