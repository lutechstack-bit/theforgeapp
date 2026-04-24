import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home, ExternalLink, X, MapPin, Phone } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GalleryImage {
  url: string;
  caption?: string;
}

interface Contact {
  name: string;
  phone: string;
}

interface StayLocation {
  id: string;
  name: string;
  full_address: string | null;
  google_maps_url: string | null;
  featured_image_url: string | null;
  gallery_images: GalleryImage[] | null;
  notes: any[] | null;
  contacts: Contact[];
}

interface TravelStaySectionProps {
  title?: string;
  subtitle?: string;
}

const TravelStaySection: React.FC<TravelStaySectionProps> = ({
  title = 'Your Venue',
  subtitle = 'Where you\'ll be living, breathing, eating and creating',
}) => {
  const navigate = useNavigate();
  const { edition } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [modalImageIdx, setModalImageIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { data: locations, isLoading } = useQuery({
    queryKey: ['home_stay_locations', edition?.id],
    queryFn: async () => {
      let locationIds: string[] | null = null;

      // If user has an edition, filter by stay_location_editions
      if (edition?.id) {
        const { data: editionLocations, error: elError } = await supabase
          .from('stay_location_editions')
          .select('stay_location_id')
          .eq('edition_id', edition.id);
        if (!elError && editionLocations && editionLocations.length > 0) {
          locationIds = editionLocations.map((el: any) => el.stay_location_id);
        }
      }

      let query = supabase
        .from('stay_locations')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (locationIds) {
        query = query.in('id', locationIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        full_address: d.full_address,
        google_maps_url: d.google_maps_url,
        featured_image_url: d.featured_image_url,
        gallery_images: d.gallery_images as GalleryImage[] | null,
        notes: d.notes,
        contacts: (d.contacts as unknown as Contact[]) || [],
      })) as StayLocation[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const location = (!isLoading && locations && locations.length > 0) ? locations[0] : null;
  const images: GalleryImage[] = location ? ((location.gallery_images as GalleryImage[]) || []) : [];
  const featuredImg = location?.featured_image_url;
  const allImages = featuredImg ? [{ url: featuredImg }, ...images] : images;

  // Autoplay for modal carousel
  useEffect(() => {
    if (!showDetail || isHovering || allImages.length <= 1) return;
    const timer = setInterval(() => {
      setModalImageIdx((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [showDetail, isHovering, allImages.length]);

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

  if (!location) return null;

  const handlePrev = () => setCurrentImageIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const handleNext = () => setCurrentImageIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const handleOpenDetail = () => {
    setModalImageIdx(0);
    setShowDetail(true);
  };

  return (
    <div className="rounded-2xl border border-[#FFBF00]/20 bg-card/30 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
        </div>
        <button
          onClick={handleOpenDetail}
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
          <div
            className="relative w-full sm:w-2/5 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-muted/50 flex-shrink-0 cursor-pointer group"
            onClick={handleOpenDetail}
          >
            <img
              src={allImages[currentImageIdx]?.url}
              alt={location.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View {allImages.length} photos
              </span>
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Dots - clickable */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentImageIdx ? 'w-4 bg-primary' : 'w-1.5 bg-white/50 hover:bg-white/70'
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
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{location.full_address}</p>
            )}

            {/* Compact contacts */}
            {location.contacts && location.contacts.length > 0 && (
              <div className="space-y-1 mb-2">
                {location.contacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground truncate">{contact.name}</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-2.5 w-2.5" />
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
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
      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 bg-card border-border/50 gap-0 [&>button]:hidden max-h-[90vh] overflow-y-auto">
          {/* Carousel */}
          {allImages.length > 0 && (
            <div
              className="relative w-full aspect-[16/10] bg-muted"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={allImages[modalImageIdx]?.url}
                alt={location.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Counter */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {modalImageIdx + 1} / {allImages.length}
              </div>
              {/* Close */}
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setModalImageIdx((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setModalImageIdx((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {/* Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setModalImageIdx(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === modalImageIdx ? 'w-5 bg-primary' : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Home className="h-5 w-5 text-primary flex-shrink-0" />
                <h3 className="text-lg font-bold text-foreground">{location.name}</h3>
              </div>
              {location.full_address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <p>{location.full_address}</p>
                </div>
              )}
            </div>

            {location.google_maps_url && (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                onClick={() => window.open(location.google_maps_url!, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
            )}

            {/* Your Life Guards - Contact Info */}
            {location.contacts && location.contacts.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-bold text-primary mb-3">Your Life Guards</h4>
                <div className="space-y-2.5">
                  {location.contacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/30 px-3.5 py-2.5">
                      <span className="text-sm font-medium text-foreground">{contact.name}</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelStaySection;
