import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GalleryImage {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  location_name?: string | null;
  is_featured?: boolean;
}

interface MasonryGalleryProps {
  images: GalleryImage[];
  title: string;
  subtitle?: string;
  emptyMessage?: string;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  images,
  title,
  subtitle,
  emptyMessage = "No images yet"
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl ${
              image.is_featured ? 'ring-2 ring-primary/50' : ''
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-medium line-clamp-1">{image.title}</p>
              {image.location_name && (
                <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {image.location_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          {selectedImage && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full max-h-[80vh] object-contain"
              />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-white text-lg font-semibold">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/70 text-sm mt-1">{selectedImage.description}</p>
                )}
                {selectedImage.location_name && (
                  <p className="text-white/60 text-xs flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" />
                    {selectedImage.location_name}
                  </p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MasonryGallery;
