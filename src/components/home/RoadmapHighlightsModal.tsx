import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Camera, Film, MapPin, Play } from 'lucide-react';

interface HighlightItem {
  id: string;
  media_url: string;
  media_type?: string;
  title?: string;
  caption?: string;
}

interface RoadmapHighlightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'moments' | 'studentWork' | 'stayLocation';
  items: HighlightItem[];
}

const getModalConfig = (type: RoadmapHighlightsModalProps['type']) => {
  switch (type) {
    case 'moments':
      return { title: 'Past Moments', icon: Camera };
    case 'studentWork':
      return { title: 'Student Work', icon: Film };
    case 'stayLocation':
      return { title: 'Where You\'ll Stay', icon: MapPin };
    default:
      return { title: 'Highlights', icon: Camera };
  }
};

export const RoadmapHighlightsModal: React.FC<RoadmapHighlightsModalProps> = ({
  open,
  onOpenChange,
  type,
  items,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const config = getModalConfig(type);
  const Icon = config.icon;
  const currentItem = items[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsVideoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsVideoPlaying(false);
  };

  // Check if the media is a YouTube video
  const isYouTubeVideo = (url: string, mediaType?: string) => {
    return mediaType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Render media content
  const renderMedia = () => {
    if (!currentItem) return null;

    const isYT = isYouTubeVideo(currentItem.media_url, currentItem.media_type);

    if (isYT) {
      const videoId = getYouTubeId(currentItem.media_url);
      if (isVideoPlaying) {
        return (
          <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      }

      return (
        <div 
          className="relative aspect-video w-full bg-black rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setIsVideoPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={currentItem.title || 'Video thumbnail'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-7 w-7 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
        </div>
      );
    }

    // Regular image
    return (
      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-secondary/30">
        <img
          src={currentItem.media_url}
          alt={currentItem.title || 'Highlight'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  if (!items || items.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {config.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
        <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative px-4 pb-4">
          {/* Main Media */}
          {renderMedia()}

          {/* Caption */}
          {currentItem?.caption && (
            <p className="mt-3 text-sm text-muted-foreground">{currentItem.caption}</p>
          )}

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border hover:bg-background transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border hover:bg-background transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Dots navigation */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsVideoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
