import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home, ExternalLink } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface GalleryImage {
  url: string;
  caption?: string;
}

interface StayLocation {
  id: string;
  name: string;
  full_address: string | null;
  google_maps_url: string | null;
  featured_image_url: string | null;
  gallery_images: GalleryImage[] | null;
  notes: any[] | null;
}

interface TravelStaySectionProps {
  title?: string;
  subtitle?: string;
}

const TravelStaySection: React.FC<TravelStaySectionProps> = ({
  title = 'Travel & Stay',
  subtitle,
}) => {
  const navigate = useNavigate();
  const { edition } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const { data: locations, isLoading } = useQuery({
    queryKey: ['home_stay_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stay_locations')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        full_address: d.full_address,
        google_maps_url: d.google_maps_url,
        featured_image_url: d.featured_image_url,
        gallery_images: d.gallery_images as GalleryImage[] | null,
        notes: d.notes,
      })) as StayLocation[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="aspect-[4/3] w-full sm:w-2/5 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </div>
    );
  }

  if (!locations || locations.length === 0) return null;

  const location = locations[0];
  const images: GalleryImage[] = (location.gallery_images as GalleryImage[]) || [];
  const featuredImg = location.featured_image_url;
  const allImages = featuredImg ? [{ url: featuredImg }, ...images] : images;

  const handlePrev = () => setCurrentImageIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const handleNext = () => setCurrentImageIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className="rounded-2xl border border-[#FFBF00]/20 bg-card/30 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
        </div>
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Details <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-4 -mt-2">{subtitle}</p>}

      {/* Content: Image Carousel + Info */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Carousel */}
        {allImages.length > 0 && (
          <div className="relative w-full sm:w-2/5 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-muted/50 flex-shrink-0">
            <img
              src={allImages[currentImageIdx]?.url}
              alt={location.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentImageIdx ? 'w-4 bg-primary' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Property Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{location.name}</h3>
            </div>
            {location.full_address && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{location.full_address}</p>
            )}
          </div>

          {location.google_maps_url && (
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto mt-2"
              onClick={() => window.open(location.google_maps_url!, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open in Maps
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelStaySection;
