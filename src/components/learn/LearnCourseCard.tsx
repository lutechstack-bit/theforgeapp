import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface LearnCourseCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  onClick?: () => void;
}

export const LearnCourseCard: React.FC<LearnCourseCardProps> = ({
  id,
  title,
  thumbnailUrl,
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
      className="group relative cursor-pointer rounded-2xl aspect-[3/4] min-w-[180px] sm:min-w-[200px] md:min-w-[220px] border border-transparent hover-gold-glow"
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
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

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

      {/* Duration Badge - Bottom Right Inside Card */}
      {duration && (
        <div className="absolute bottom-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{duration}</span>
          </div>
        </div>
      )}
    </div>
  );
};
