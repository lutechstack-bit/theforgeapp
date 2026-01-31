import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContentCarouselProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
  className?: string;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  children,
  onSeeAll,
  className,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn("space-y-4 reveal-section", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 hidden sm:flex transition-all duration-200",
              !canScrollLeft && "opacity-30 cursor-not-allowed"
            )}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 hidden sm:flex transition-all duration-200",
              !canScrollRight && "opacity-30 cursor-not-allowed"
            )}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onSeeAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSeeAll}
              className="hover:text-primary transition-colors duration-200"
            >
              See all
            </Button>
          )}
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-4 -my-4 px-4 -mx-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {React.Children.map(children, (child, index) => (
          <div 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
