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
import { Sparkles } from 'lucide-react';

interface LearnContent {
  id: string;
  title: string;
  thumbnail_url?: string;
  instructor_name?: string;
  company_name?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  progress_percent?: number;
  is_completed?: boolean;
}

interface PremiumVideoCarouselProps {
  title: string;
  items: LearnContent[];
  isFullAccess: boolean;
  onItemClick: (item: LearnContent) => void;
  emptyMessage?: string;
}

export const PremiumVideoCarousel: React.FC<PremiumVideoCarouselProps> = ({
  title,
  items,
  isFullAccess,
  onItemClick,
  emptyMessage = 'No content available yet',
}) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl">
        <Sparkles className="h-10 w-10 text-primary/50 mx-auto mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      
      <Carousel
        opts={{
          align: 'start',
          loop: items.length > 3,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-4 -my-4">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <PremiumVideoCard
                id={item.id}
                title={item.title}
                thumbnailUrl={item.thumbnail_url}
                instructorName={item.instructor_name}
                companyName={item.company_name}
                durationMinutes={item.duration_minutes}
                isPremium={item.is_premium}
                progressPercent={item.progress_percent}
                isCompleted={item.is_completed}
                onClick={() => navigate(`/learn/${item.id}`)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {items.length > 3 && (
          <>
            <CarouselPrevious className="-left-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
            <CarouselNext className="-right-4 bg-card/80 backdrop-blur-md border-border/50 hover:bg-card" />
          </>
        )}
      </Carousel>
    </div>
  );
};
