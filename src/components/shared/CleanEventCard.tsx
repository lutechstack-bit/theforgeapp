import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Zap, CheckCircle, Video } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';

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
  isRegistered,
  isPastEvent,
  onRegister,
  onClick,
  className,
}) => {
  const eventPast = isPastEvent ?? isPast(date);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30",
        "hover:shadow-[0_8px_30px_hsl(var(--primary)/0.1)]",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Filling Fast Badge */}
          {isFillingFast && !eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] font-semibold flex items-center gap-1 shadow-lg">
              <Zap className="h-3 w-3" />
              FILLING FAST
            </div>
          )}
          
          {/* Past Event Badge */}
          {eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-muted/80 backdrop-blur-md text-muted-foreground text-[10px] font-semibold flex items-center gap-1">
              <Video className="h-3 w-3" />
              PAST EVENT
            </div>
          )}
          
          {/* Event Type Badge */}
          {eventType && !isFillingFast && !eventPast && (
            <div className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md text-foreground text-[10px] font-medium">
              {eventType}
            </div>
          )}
        </div>
        
        {/* Title on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 space-y-3">
        {/* Date & Location */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {format(date, 'EEE, MMM d · h:mm a')}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {isVirtual ? 'Virtual' : location || 'TBA'}
          </span>
        </div>
        
        {/* CTA Button */}
        {!eventPast && (
          <Button
            onClick={onRegister}
            variant={isRegistered ? 'secondary' : 'default'}
            size="sm"
            className={cn(
              "w-full gap-2 transition-all",
              isRegistered && "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
            )}
          >
            {isRegistered ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Registered
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Attend Event
              </>
            )}
          </Button>
        )}
        
        {/* View Recording for past events */}
        {eventPast && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Video className="h-4 w-4" />
            View Details
          </Button>
        )}
      </div>
    </div>
  );
};
