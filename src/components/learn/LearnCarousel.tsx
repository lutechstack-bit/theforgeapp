import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PremiumCourseCard } from '@/components/shared/PremiumCourseCard';
import { Play, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearnContent {
  id: string;
  title: string;
  thumbnail_url?: string;
  instructor_name?: string;
  company_name?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
}

interface LearnCarouselProps {
  title: string;
  items: LearnContent[];
  isFullAccess: boolean;
  onItemClick: (item: LearnContent) => void;
  emptyMessage?: string;
}

export const LearnCarousel: React.FC<LearnCarouselProps> = ({
  title,
  items,
  isFullAccess,
  onItemClick,
  emptyMessage = 'No content available yet',
}) => {
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
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div
                onClick={() => onItemClick(item)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500",
                  "glass-card-hover"
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 via-accent/20 to-muted/50 flex items-center justify-center">
                      <Play className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
                  
                  {/* Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md",
                      item.is_premium && !isFullAccess
                        ? "bg-muted/80 border border-border/50"
                        : "bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.5)] border border-primary/30"
                    )}>
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {item.duration_minutes && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1">
                      <Clock className="h-3 w-3 text-white/80" />
                      <span className="text-xs text-white font-medium">
                        {item.duration_minutes} min
                      </span>
                    </div>
                  )}

                  {/* Premium Badge */}
                  {item.is_premium && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary-foreground" />
                      <span className="text-xs text-primary-foreground font-semibold">
                        Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.instructor_name && (
                      <span className="text-xs text-muted-foreground">
                        {item.instructor_name}
                      </span>
                    )}
                    {item.company_name && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground">
                        {item.company_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
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