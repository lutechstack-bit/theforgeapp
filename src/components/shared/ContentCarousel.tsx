import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentCarouselProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  children,
  onSeeAll,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onSeeAll && (
            <Button variant="ghost" size="sm" onClick={onSeeAll}>
              See all
            </Button>
          )}
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
    </div>
  );
};
