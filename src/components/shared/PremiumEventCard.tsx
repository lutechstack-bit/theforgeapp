import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PremiumEventCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  date: Date;
  location: string;
  isVirtual?: boolean;
  hostName?: string;
  hostAvatar?: string;
  isFillingFast?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PremiumEventCard: React.FC<PremiumEventCardProps> = ({
  title,
  imageUrl,
  date,
  location,
  isVirtual,
  hostName,
  hostAvatar,
  isFillingFast,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl",
        "bg-card border border-border/30",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
        
        {/* Filling Fast Badge */}
        {isFillingFast && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <Zap className="h-3 w-3" />
            FILLING FAST
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-bold text-foreground text-xl leading-tight mb-3 line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-border/30">
        {/* Host Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-border/50">
            <AvatarImage src={hostAvatar} alt={hostName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {hostName?.charAt(0) || 'H'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground font-medium line-clamp-1 max-w-[100px]">
            {hostName || 'Host'}
          </span>
        </div>
        
        {/* Date & Location */}
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {format(date, 'EEE, MMM d')}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {isVirtual ? 'Virtual' : location}
          </span>
        </div>
      </div>
    </div>
  );
};
