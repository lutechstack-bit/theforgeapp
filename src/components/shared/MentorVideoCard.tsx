import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MentorCardProps {
  name: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  companyName?: string;
  companyLogoUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const MentorVideoCard: React.FC<MentorCardProps> = ({
  name,
  title,
  subtitle,
  imageUrl,
  companyName,
  companyLogoUrl,
  onClick,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative min-w-[220px] sm:min-w-[260px] md:min-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group",
        "transition-all duration-500 hover:shadow-xl hover:shadow-primary/10",
        "hover:-translate-y-1",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background Image with Skeleton */}
      <div className="absolute inset-0">
        {!imageLoaded && imageUrl && (
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {/* Title & Subtitle */}
        <div className="mb-3">
          {subtitle && (
            <p className="text-xs sm:text-sm italic text-foreground/70 mb-0.5">{subtitle}</p>
          )}
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight uppercase tracking-wide">
            {title}
          </h3>
        </div>

        {/* Name & Company */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-foreground/80 font-medium">{name}</span>
          
          {(companyName || companyLogoUrl) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/90">
              {companyLogoUrl && (
                <img src={companyLogoUrl} alt={companyName} className="w-4 h-4 object-contain" />
              )}
              {companyName && (
                <span className="text-xs font-medium text-background">{companyName}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
