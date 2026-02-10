import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Play, ChevronRight } from 'lucide-react';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SecureVideoPlayer } from '@/components/learn/SecureVideoPlayer';

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

        {/* Film Cards - Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {alumni.map((a) => (
            <div
              key={a.id}
              onClick={() => setPlayingVideo({ url: a.video_url, title: a.film || a.name })}
              className="flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted/50 border border-border/30 mb-2">
                {a.thumbnail_url ? (
                  <img
                    src={a.thumbnail_url}
                    alt={a.film || a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                {a.film || 'Untitled Film'}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                by {a.name}{a.role ? ` · ${a.role}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Video Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-black border-border/50">
          <DialogTitle className="sr-only">{playingVideo?.title}</DialogTitle>
          {playingVideo && (
            <div className="aspect-video">
              <SecureVideoPlayer
                videoUrl={playingVideo.url}
                contentId={playingVideo.url}
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
