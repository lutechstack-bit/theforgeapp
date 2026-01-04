import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Mentor } from '@/data/mentorsData';

interface MentorDetailModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
  mentor,
  isOpen,
  onClose,
}) => {
  if (!mentor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-card border-border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row">
          {/* Left: Photo */}
          <div className="md:w-2/5 relative">
          <div className="aspect-[3/4] md:h-full">
              <img
                src={mentor.modalImageUrl || mentor.imageUrl}
                alt={mentor.name}
                className="w-full h-full object-cover object-top rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
            {/* Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {mentor.name}
            </h2>
            
            {/* Roles */}
            <p className="text-sm md:text-base text-primary font-semibold uppercase tracking-wide mb-6">
              {mentor.roles.join(' | ')}
            </p>

            {/* Bio */}
            <div className="space-y-4 mb-8">
              {mentor.bio.map((paragraph, idx) => (
                <p 
                  key={idx} 
                  className="text-sm md:text-base text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Brands */}
            {mentor.brands.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-3">
                  {mentor.brands.map((brand, idx) => (
                    <div
                      key={idx}
                      className="h-14 px-4 bg-muted/50 rounded-lg flex items-center justify-center border border-border/50"
                    >
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="h-10 max-w-[100px] object-contain"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
