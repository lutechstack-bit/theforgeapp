import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Zap, Video } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CleanEventCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  date: Date;
  location?: string;
  isVirtual?: boolean;
  eventType?: string;
  isFillingFast?: boolean;
  isRegistered?: boolean;
  isPastEvent?: boolean;
  hostName?: string;
  hostAvatar?: string;
  onRegister?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

export const CleanEventCard: React.FC<CleanEventCardProps> = ({
  title,
  imageUrl,
  date,
  location,
  isVirtual,
  eventType,
  isFillingFast,
  isPastEvent,
  hostName,
  hostAvatar,
  onClick,
  className,
}) => {
  const eventPast = isPastEvent ?? isPast(date);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "bg-card border border-[#FFBF00]/20",
        "active:scale-[0.98]",
        className
      )}
    >
      {/* Image Container - Portrait */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted/30 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {isFillingFast && !eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-semibold flex items-center gap-1 shadow-lg">
              <Zap className="h-3 w-3" />
              FILLING FAST
            </div>
          )}
          
          {eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-muted/80 backdrop-blur-md text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
              <Video className="h-3 w-3" />
              PAST EVENT
            </div>
          )}
          
          {eventType && !isFillingFast && !eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md text-foreground text-[10px] font-medium">
              {eventType}
            </div>
          )}
        </div>
        
        {/* Title on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer - Host + Date/Location pills */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        {/* Host */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          {hostName ? (
            <>
              <Avatar className="h-6 w-6 shrink-0">
                {hostAvatar && <AvatarImage src={hostAvatar} alt={hostName} />}
                <AvatarFallback className="text-[10px] bg-muted">
                  {hostName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{hostName}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              {format(date, 'EEE, MMM d')}
            </span>
          )}
        </div>

        {/* Date + Location pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hostName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(date, 'MMM d')}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {isVirtual ? 'Virtual' : location || 'TBA'}
          </span>
        </div>
      </div>
    </div>
  );
};
