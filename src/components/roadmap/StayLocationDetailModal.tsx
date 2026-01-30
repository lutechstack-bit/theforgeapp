import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronLeft, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Contact {
  name: string;
  phone: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface StayLocation {
  id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  google_maps_url?: string;
  contacts?: Contact[];
  notes?: string[];
  gallery_images?: GalleryImage[];
  featured_image_url?: string;
}

interface StayLocationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: StayLocation | null;
}

const StayLocationDetailModal: React.FC<StayLocationDetailModalProps> = ({
  open,
  onOpenChange,
  location
}) => {
  const isMobile = useIsMobile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!location) return null;

  const contacts = location.contacts || [];
  const notes = location.notes || [];
  const galleryImages = location.gallery_images || [];

  const allImages = [
    ...(location.featured_image_url ? [{ url: location.featured_image_url, caption: 'Featured' }] : []),
    ...galleryImages
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const formatAddress = () => {
    const parts = [
      location.address_line1,
      location.address_line2,
      location.city,
      location.postcode
    ].filter(Boolean);
    return parts;
  };

  const Content = () => (
    <div className="space-y-5 pb-4">
      {/* Hotel Name & Address */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{location.name}</h2>
        <div className="space-y-1">
          {formatAddress().map((line, idx) => (
            <p key={idx} className="text-sm text-muted-foreground">{line}</p>
          ))}
        </div>
        
        {location.google_maps_url && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto text-primary hover:text-primary/80"
            onClick={() => window.open(location.google_maps_url, '_blank')}
          >
            <MapPin className="w-4 h-4 mr-1" />
            View on Google Maps
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Image Gallery */}
      {allImages.length > 0 && (
        <div className="relative rounded-xl overflow-hidden bg-secondary/30">
          <div className="aspect-[16/10]">
            <img
              src={allImages[currentImageIndex]?.url}
              alt={allImages[currentImageIndex]?.caption || 'Stay location'}
              className="w-full h-full object-cover"
            />
          </div>
          
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-white w-4' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Contact Section */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Contact
          </h3>
          <div className="space-y-2">
            {contacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{contact.name}</span>
                <span className="text-sm text-primary font-mono">{contact.phone}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Things to Keep in Mind */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Things to Keep in Mind
          </h3>
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            {notes.map((note, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-primary font-medium text-sm">{idx + 1}.</span>
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border/50 pb-3">
            <DrawerTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Where You'll Stay
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pt-4 overflow-y-auto">
            <Content />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Where You'll Stay
          </DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};

export default StayLocationDetailModal;
