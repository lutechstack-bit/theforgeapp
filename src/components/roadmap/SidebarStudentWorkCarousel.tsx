import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Film, Play, ExternalLink, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentWorkItem {
  id: string;
  media_url: string;
  media_type: 'youtube' | 'instagram' | 'image';
  title?: string;
  caption?: string;
}

interface SidebarStudentWorkCarouselProps {
  items: StudentWorkItem[];
  onViewAll?: () => void;
}

const SidebarStudentWorkCarousel: React.FC<SidebarStudentWorkCarouselProps> = ({ items, onViewAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsVideoActive(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsVideoActive(false);
  };

  if (!items || items.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Student Work</h3>
        </div>
        <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1];
  };

  const extractInstagramId = (url: string) => {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    return match?.[1];
  };

  const renderMedia = () => {
    if (currentItem.media_type === 'youtube' && isVideoActive) {
      const videoId = extractYouTubeId(currentItem.media_url);
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={currentItem.title || 'Student work'}
        />
      );
    }

    if (currentItem.media_type === 'instagram' && isVideoActive) {
      return (
        <iframe
          src={`https://www.instagram.com/p/${extractInstagramId(currentItem.media_url)}/embed`}
          className="w-full h-full"
          allowFullScreen
          title={currentItem.title || 'Student work'}
        />
      );
    }

    // Thumbnail/preview state
    const thumbnailUrl = currentItem.media_type === 'youtube' 
      ? `https://img.youtube.com/vi/${extractYouTubeId(currentItem.media_url)}/mqdefault.jpg`
      : currentItem.media_url;

    return (
      <div 
        className="relative w-full h-full cursor-pointer group"
        onClick={() => setIsVideoActive(true)}
      >
        <img
          src={thumbnailUrl}
          alt={currentItem.title || 'Student work'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 rounded-full bg-primary/90 text-primary-foreground">
            <Play className="w-5 h-5" />
          </div>
        </div>
        {currentItem.media_type !== 'image' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-[10px] flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {currentItem.media_type === 'youtube' ? 'YouTube' : 'Instagram'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-xl p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Student Work</h3>
        </div>
        <div className="flex items-center gap-1">
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{currentIndex + 1}/{items.length}</span>
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

      {/* Video Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/30">
        {renderMedia()}
      </div>

      {/* Caption */}
      {currentItem.caption && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{currentItem.caption}</p>
      )}
    </div>
  );
};

export default SidebarStudentWorkCarousel;
