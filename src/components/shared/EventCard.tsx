import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Zap } from 'lucide-react';

interface EventCardProps {
  title: string;
  date: string;
  location?: string;
  imageUrl?: string;
  hostName?: string;
  hostAvatarUrl?: string;
  badge?: string;
  isFillingFast?: boolean;
  isVirtual?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  imageUrl,
  hostName,
  hostAvatarUrl,
  badge,
  isFillingFast,
  isVirtual,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "min-w-[240px] sm:min-w-[280px] md:min-w-[320px] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group",
        "bg-card border border-border hover:border-primary/30 transition-all duration-500",
        "hover:shadow-[0_12px_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary/40" />
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badge */}
        {(badge || isFillingFast) && (
          <div className="absolute top-3 left-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm",
              isFillingFast 
                ? "bg-orange-500/90 text-white" 
                : "bg-primary/90 text-primary-foreground"
            )}>
              {isFillingFast && <Zap className="w-3 h-3" />}
              {isFillingFast ? 'FILLING FAST' : badge}
            </span>
          </div>
        )}

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h4>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4 bg-card">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Host Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {hostAvatarUrl ? (
              <img
                src={hostAvatarUrl}
                alt={hostName || 'Host'}
                className="w-10 h-10 rounded-full object-cover border-2 border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-2 border-border">
                <span className="text-sm font-semibold text-primary">
                  {hostName?.charAt(0) || 'H'}
                </span>
              </div>
            )}
            {hostName && (
              <span className="text-sm font-medium text-foreground truncate">
                {hostName}
              </span>
            )}
          </div>

          {/* Date & Location */}
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{date}</span>
            </div>
            {(location || isVirtual) && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs">{isVirtual ? 'Virtual' : location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
