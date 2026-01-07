import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PremiumVideoCard } from './PremiumVideoCard';
import { Play } from 'lucide-react';

interface ContinueWatchingItem {
  id: string;
  title: string;
  thumbnail_url?: string;
  instructor_name?: string;
  duration_minutes?: number;
  progress_percent: number;
  is_completed: boolean;
}

interface ContinueWatchingCarouselProps {
  items: ContinueWatchingItem[];
  onItemClick?: (item: ContinueWatchingItem) => void;
}

export const ContinueWatchingCarousel: React.FC<ContinueWatchingCarouselProps> = ({
  items,
  onItemClick,
}) => {
  const navigate = useNavigate();

  // Only show items that are in progress (not completed, with some progress)
  const inProgressItems = items.filter(item => item.progress_percent > 0 && !item.is_completed);

  if (inProgressItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Continue Watching</h3>
      </div>
      
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {inProgressItems.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <PremiumVideoCard
                id={item.id}
                title={item.title}
                thumbnailUrl={item.thumbnail_url}
                instructorName={item.instructor_name}
                durationMinutes={item.duration_minutes}
                progressPercent={item.progress_percent}
                isCompleted={item.is_completed}
                onClick={() => {
                  if (onItemClick) {
                    onItemClick(item);
                  } else {
                    navigate(`/learn/${item.id}`);
                  }
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {inProgressItems.length > 3 && (
          <>
            <CarouselPrevious className="-left-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
            <CarouselNext className="-right-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
          </>
        )}
      </Carousel>
    </div>
  );
};
