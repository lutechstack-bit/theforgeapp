import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mentor } from '@/data/mentorsData';
import { Skeleton } from '@/components/ui/skeleton';

interface FlipMentorCardProps {
  mentor: Mentor;
  onClick?: () => void;
  className?: string;
}

export const FlipMentorCard: React.FC<FlipMentorCardProps> = ({
  mentor,
  onClick,
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleCardClick = () => {
    if (isTouchDevice) {
      setIsFlipped(prev => !prev);
    }
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      className={cn(
        "relative min-w-[160px] xs:min-w-[180px] sm:min-w-[200px] md:min-w-[220px] aspect-[3/4] cursor-pointer flex-shrink-0 tap-scale",
        "perspective-1000",
        className
      )}
      style={{ 
        scrollSnapAlign: 'start',
        perspective: '1000px',
      }}
      onClick={handleCardClick}
      onMouseEnter={() => !isTouchDevice && setIsFlipped(true)}
      onMouseLeave={() => !isTouchDevice && setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 ease-out",
          "transform-style-preserve-3d"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Image with Skeleton */}
          <div className="absolute inset-0">
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            )}
            <img
              src={mentor.imageUrl}
              alt={mentor.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover object-top transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          </div>

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight mb-1.5">
              {mentor.name}
            </h3>
            <p className="text-xs text-muted-foreground/80 font-medium uppercase tracking-wide">
              {mentor.roles.slice(0, 2).join(' • ')}
            </p>
            
          </div>

          {/* Premium corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/30 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
          </div>

          {/* Border glow on hover */}
          <div className="absolute inset-0 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(41_100%_62%/0.3),0_0_50px_hsl(39_90%_44%/0.2)] transition-all duration-300" />
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden bg-card border border-border"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col p-4 sm:p-5">
            {/* Header */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {mentor.name}
              </h3>
              <p className="text-xs text-primary font-medium uppercase tracking-wide">
                {mentor.roles.join(' • ')}
              </p>
            </div>

            {/* Bio preview */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
              {mentor.bio[0]}
            </p>

            {/* Brands */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Worked with
              </p>
              <div className="flex flex-wrap gap-2">
                {mentor.brands.slice(0, 3).map((brand, idx) => (
                  <div
                    key={idx}
                    className="h-8 px-2 bg-background/80 rounded-md flex items-center justify-center border border-border/50"
                  >
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-5 max-w-[60px] object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-medium text-foreground">
                        {brand.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* View More Button */}
            <button
              onClick={handleViewMore}
              className="mt-auto w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Full Profile
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
