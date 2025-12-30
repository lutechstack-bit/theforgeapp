import React from 'react';
import { cn } from '@/lib/utils';

interface CarouselCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  title,
  subtitle,
  imageUrl,
  badge,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "min-w-[200px] sm:min-w-[240px] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0",
        "glass-card-hover group",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {imageUrl && (
        <div className="aspect-video overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 relative">
        {badge && (
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/20 mb-2 backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{title}</h4>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
