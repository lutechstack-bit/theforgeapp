import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeCarouselSkeletonProps {
  title: string;
  itemCount?: number;
}

export const HomeCarouselSkeleton: React.FC<HomeCarouselSkeletonProps> = ({ 
  title,
  itemCount = 4 
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="min-w-[160px] sm:min-w-[200px] flex-shrink-0">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
