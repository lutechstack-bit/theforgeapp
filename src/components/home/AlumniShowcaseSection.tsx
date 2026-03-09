import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function extractYouTubeId(input: string): string | null {
  const match = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
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
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string; author: string } | null>(null);

  if (isLoading) {
    return <HomeCarouselSkeleton title={title} />;
  }

  if (alumni.length === 0) return null;

  const getEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
  };

  const handleItemClick = (item: AlumniShowcaseItem) => {
    if (item.media_type === 'image') {
      if (item.redirect_url) {
        window.open(item.redirect_url, '_blank');
      } else if (item.media_url) {
        setViewingImage({ url: item.media_url, title: item.title, author: item.author_name });
      }
    } else {
      if (item.media_url) {
        setPlayingVideo({ url: item.media_url, title: item.title });
      }
    }
  };

  // Determine card aspect ratio based on cohort
  const getCardClass = () => {
    if (cohortType === 'FORGE_WRITING') return 'aspect-[2/3]'; // portrait book covers
    if (cohortType === 'FORGE_CREATORS') return 'aspect-[9/16]'; // vertical reels
    return 'aspect-video'; // landscape 16:9
  };

  const getCardWidth = () => {
    if (cohortType === 'FORGE_WRITING') return 'w-[160px] sm:w-[180px]';
    if (cohortType === 'FORGE_CREATORS') return 'w-[150px] sm:w-[170px]';
    return 'w-[calc(100vw-72px)] sm:w-[280px]';
  };

  return (
    <>
      <div className="rounded-2xl border border-[#FFBF00]/20 bg-card/30 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
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
                <div className={`relative ${getCardClass()} rounded-2xl overflow-hidden bg-black`}>
                  {(a.thumbnail_url || a.media_url) ? (
                    <img
                      src={a.thumbnail_url || a.media_url || ''}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Play button for video/reel types */}
                  {a.media_type !== 'image' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                        <Play className="h-3.5 w-3.5 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Overlay text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-sm font-semibold text-white line-clamp-1">
                      {a.title}
                    </h4>
                    <p className="text-[11px] text-white/70 line-clamp-1">
                      by {a.author_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Dialog */}
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

      {/* Image Lightbox Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-black border-border/50">
          <DialogTitle className="sr-only">{viewingImage?.title}</DialogTitle>
          {viewingImage && (
            <div className="relative">
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="text-base font-semibold text-white">{viewingImage.title}</h4>
                <p className="text-sm text-white/70">by {viewingImage.author}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlumniShowcaseSection;
