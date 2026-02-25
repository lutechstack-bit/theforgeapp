import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Play, ChevronRight } from 'lucide-react';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function extractYouTubeId(input: string): string | null {
  const match = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

interface AlumniData {
  id: string;
  name: string;
  role?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  film?: string | null;
  achievement?: string | null;
}

interface AlumniShowcaseSectionProps {
  alumni: AlumniData[];
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const AlumniShowcaseSection: React.FC<AlumniShowcaseSectionProps> = ({
  alumni,
  isLoading,
  title = 'Alumni Showcase',
  subtitle,
}) => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  if (isLoading) {
    return <HomeCarouselSkeleton title={title} />;
  }

  if (alumni.length === 0) return null;

  const getEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
  };

  return (
    <>
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
          </div>
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {subtitle || 'Click to watch films from past Forgers'}
        </p>

        {/* Film Strip Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1" style={{ scrollSnapType: 'x mandatory' }}>
          {alumni.map((a) => (
            <div
              key={a.id}
              onClick={() => setPlayingVideo({ url: a.video_url, title: a.film || a.name })}
              className="flex-shrink-0 w-[260px] sm:w-[300px] cursor-pointer group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {a.thumbnail_url ? (
                  <img
                    src={a.thumbnail_url}
                    alt={a.film || a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                    <Film className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                {/* Vignette gradient — bottom half only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Play button — frosted, subtle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    <Play className="h-3.5 w-3.5 text-white fill-current ml-0.5" />
                  </div>
                </div>
                {/* Overlay text — bottom-left */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">
                    {a.film || 'Student Film'}
                  </h4>
                  <p className="text-[11px] text-white/70 line-clamp-1">
                    by {a.name}{a.role ? ` · ${a.role}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Video Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-black border-border/50">
          <DialogTitle className="sr-only">{playingVideo?.title}</DialogTitle>
          {playingVideo && (
            <div className="aspect-video">
              <iframe
                src={getEmbedUrl(playingVideo.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={playingVideo.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlumniShowcaseSection;
