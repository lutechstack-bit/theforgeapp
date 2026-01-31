import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StayItem {
  id: string;
  media_url: string;
  title?: string;
  caption?: string;
}

interface SidebarStayCarouselProps {
  items: StayItem[];
  onViewAll?: () => void;
}

const SidebarStayCarousel: React.FC<SidebarStayCarouselProps> = ({ items, onViewAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out items with empty media_url
  const validItems = items.filter(item => item.media_url);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % validItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + validItems.length) % validItems.length);
  };

  if (!validItems || validItems.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-foreground">Stay Location</h3>
        </div>
        <div className="aspect-[4/3] bg-secondary/50 rounded-lg flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>
    );
  }

  const currentItem = validItems[currentIndex];

  return (
    <div className="glass-card rounded-xl p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-foreground">Stay Location</h3>
        </div>
        <div className="flex items-center gap-1">
          {validItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{currentIndex + 1}/{validItems.length}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={nextSlide}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
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
          alt={currentItem.title || 'Stay location'}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        
        {/* Location name overlay */}
        {currentItem.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-white/80" />
              <p className="text-xs text-white/90">{currentItem.caption}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarStayCarousel;
