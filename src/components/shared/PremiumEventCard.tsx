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
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500",
        "glass-card-hover",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted/50" />
        )}
        
        {/* Premium Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-85" />
        
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        
        {/* Filling Fast Badge */}
        {isFillingFast && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_20px_hsl(var(--primary)/0.4)] border border-primary/30">
            <Zap className="h-3 w-3" />
            FILLING FAST
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-bold text-foreground text-xl leading-tight mb-3 line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer Info with Glass Effect */}
      <div className="px-5 py-4 flex items-center justify-between glass border-t border-border/20">
        {/* Host Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-primary/10">
            <AvatarImage src={hostAvatar} alt={hostName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {hostName?.charAt(0) || 'H'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground font-medium line-clamp-1 max-w-[100px]">
            {hostName || 'Host'}
          </span>
        </div>
        
        {/* Date & Location */}
        <div className="flex flex-col items-end gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-foreground/5 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Calendar className="h-3 w-3 text-primary" />
            {format(date, 'EEE, MMM d')}
          </span>
          <span className="flex items-center gap-1.5 bg-foreground/5 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-primary" />
            {isVirtual ? 'Virtual' : location}
          </span>
        </div>
      </div>
    </div>
  );
};
