import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Mentor } from '@/data/mentorsData';
import { cn } from '@/lib/utils';

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card border-border">
        {/* Header with Image */}
        <div className="relative">
          {/* Gradient overlay for image */}
          <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
            <img
              src={mentor.imageUrl}
              alt={mentor.name}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>
          
          {/* Content overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {mentor.name}
              </DialogTitle>
              <p className="text-sm text-primary font-medium tracking-wide uppercase">
                {mentor.roles.join(' | ')}
              </p>
            </DialogHeader>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 pt-4 space-y-6">
          {/* Bio */}
          <div className="space-y-3">
            {mentor.bio.map((paragraph, idx) => (
              <p 
                key={idx} 
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Brands/Worked With */}
          {mentor.brands.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Worked With
              </h4>
              <div className="flex flex-wrap gap-2">
                {mentor.brands.map((brand, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="px-3 py-1.5 text-xs font-medium bg-muted/50 text-foreground border-0"
                  >
                    {brand.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
