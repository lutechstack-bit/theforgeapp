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
        'hover-gold-glow tap-scale transition-transform duration-300',
        'bg-muted',
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <span className="text-muted-foreground text-sm text-center px-4">{title}</span>
        </div>
      )}
    </div>
  );
};
