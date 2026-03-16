import React, { useState } from 'react';
import { Play } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function extractYouTubeId(input: string): string | null {
  const match = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractVimeoId(input: string): string | null {
  const match = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

interface AlumniShowcaseItem {
  id: string;
  title: string;
  author_name: string;
  cohort_type: string;
  media_type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  redirect_url: string | null;
  description: string | null;
}

interface AlumniShowcaseSectionProps {
  alumni: AlumniShowcaseItem[];
  isLoading: boolean;
  cohortType: string;
  title?: string;
  subtitle?: string;
}

const AlumniShowcaseSection: React.FC<AlumniShowcaseSectionProps> = ({
  alumni,
  isLoading,
  cohortType,
  title = 'Alumni Showcase',
  subtitle,
}) => {
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string; isVertical: boolean } | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string; author: string } | null>(null);

  if (isLoading) {
    return <HomeCarouselSkeleton title={title} />;
  }

  if (alumni.length === 0) return null;

  const getEmbedUrl = (url: string) => {
    const vimeoId = extractVimeoId(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }
    const ytId = extractYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    }
    return url;
  };

  const handleItemClick = (item: AlumniShowcaseItem) => {
    // Writing: open redirect or lightbox
    if (item.media_type === 'image') {
      if (item.redirect_url) {
        window.open(item.redirect_url, '_blank');
      } else if (item.thumbnail_url || item.media_url) {
        setViewingImage({
          url: item.thumbnail_url || item.media_url || '',
          title: item.title,
          author: item.author_name,
        });
      }
      return;
    }

    // Reel or video: play in modal
    const videoUrl = item.media_url || item.thumbnail_url;
    if (videoUrl) {
      const isVertical = item.media_type === 'reel';
      setPlayingVideo({ url: videoUrl, title: item.title, isVertical });
    }
  };

  // Card sizing per cohort
  const getCardWidth = () => {
    if (cohortType === 'FORGE_WRITING') return 'w-[140px] sm:w-[160px]';
    if (cohortType === 'FORGE_CREATORS') return 'w-[150px] sm:w-[170px]';
    return 'w-[calc(100vw-72px)] sm:w-[280px]';
  };

  const getAspectClass = () => {
    if (cohortType === 'FORGE_WRITING') return 'aspect-[2/3]';
    if (cohortType === 'FORGE_CREATORS') return 'aspect-[9/16]';
    return 'aspect-video';
  };

  return (
    <>
      <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {subtitle || 'Work created by past Forgers'}
        </p>

        {/* Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
          {alumni.map((a) => (
            <div
              key={a.id}
              className={`flex-shrink-0 ${getCardWidth()} snap-start`}
            >
              <div
                onClick={() => handleItemClick(a)}
                className="cursor-pointer group"
              >
                {/* Image / Thumbnail */}
                <div className={`relative ${getAspectClass()} rounded-xl overflow-hidden bg-secondary`}>
                  {(a.thumbnail_url || a.media_url) ? (
                    <img
                      src={a.thumbnail_url || a.media_url || ''}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Play icon for video/reel — no gradient overlay */}
                  {a.media_type !== 'image' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                        <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text below card */}
                <div className="mt-2 px-0.5">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.author_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Dialog — supports vertical (reels) and horizontal */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent
          className={`p-0 overflow-hidden bg-black border-border/50 ${
            playingVideo?.isVertical
              ? 'max-w-sm'
              : 'max-w-2xl'
          }`}
        >
          <DialogTitle className="sr-only">{playingVideo?.title}</DialogTitle>
          {playingVideo && (
            <div
              className={
                playingVideo.isVertical
                  ? 'aspect-[9/16] max-h-[80vh]'
                  : 'aspect-video'
              }
            >
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

      {/* Image Lightbox */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-lg p-2 overflow-hidden bg-card border-border/50">
          <DialogTitle className="sr-only">{viewingImage?.title}</DialogTitle>
          {viewingImage && (
            <div className="space-y-3">
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="px-1 pb-1">
                <h4 className="text-base font-semibold text-foreground">{viewingImage.title}</h4>
                <p className="text-sm text-muted-foreground">by {viewingImage.author}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlumniShowcaseSection;
