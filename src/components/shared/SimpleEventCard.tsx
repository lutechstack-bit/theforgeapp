import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleEventCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const SimpleEventCard: React.FC<SimpleEventCardProps> = ({
  id,
  title,
  imageUrl,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer',
        'min-w-[180px] sm:min-w-[200px] md:min-w-[220px]',
        'hover-gold-glow tap-scale transition-transform duration-300',
        'bg-black/40',
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <>
          {/* Layer 1: Blurred background (fills dead space) */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
          />
          
          {/* Layer 2: Subtle dark overlay */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Layer 3: Sharp poster with auto-trim (edges cropped) */}
          <img
            src={imageUrl}
            alt={title}
            className="relative w-full h-full object-cover z-10"
          />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <span className="text-muted-foreground text-sm text-center px-4">{title}</span>
        </div>
      )}
    </div>
  );
};
