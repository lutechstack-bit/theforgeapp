import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MomentsItem {
  id: string;
  media_url: string;
  title?: string;
  caption?: string;
}

interface SidebarMomentsCarouselProps {
  items: MomentsItem[];
  autoScrollInterval?: number;
  onViewAll?: () => void;
}

const SidebarMomentsCarousel: React.FC<SidebarMomentsCarouselProps> = ({
  items,
  autoScrollInterval = 5000,
  onViewAll
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-scroll with reduced motion support
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(nextSlide, autoScrollInterval);
    return () => clearInterval(timer);
  }, [items.length, isPaused, nextSlide, autoScrollInterval]);

  if (!items || items.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Past Moments</h3>
        </div>
        <div className="aspect-[4/3] bg-secondary/50 rounded-lg flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div 
      className="glass-card rounded-xl p-3 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Past Moments</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{currentIndex + 1}/{items.length}</span>
          {onViewAll && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onViewAll}
              title="View all"
            >
              <Expand className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="relative aspect-[4/3] rounded-lg overflow-hidden bg-secondary/30 cursor-pointer"
        onClick={onViewAll}
      >
        <img
          src={currentItem.media_url}
          alt={currentItem.title || 'Forge moment'}
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
        
        {/* Caption overlay */}
        {currentItem.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-xs text-white/90 line-clamp-2">{currentItem.caption}</p>
          </div>
        )}

        {/* Navigation dots */}
        {items.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarMomentsCarousel;
