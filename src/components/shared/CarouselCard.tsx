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
        "min-w-[200px] sm:min-w-[240px] bg-card rounded-xl border border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-200 flex-shrink-0",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {imageUrl && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        {badge && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
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
