import React from 'react';
import { Camera, Aperture, Mic, Lightbulb, Video, Code, Package } from 'lucide-react';

interface EquipmentCardProps {
  equipment: {
    id: string;
    category: string;
    brand: string;
    name: string;
    model: string | null;
    description: string | null;
    specs: string[];
    image_url: string | null;
  };
}

const categoryIcons: Record<string, React.ElementType> = {
  camera: Camera,
  lens: Aperture,
  audio: Mic,
  lighting: Lightbulb,
  grip: Video,
  software: Code,
};

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const Icon = categoryIcons[equipment.category] || Package;
  
  // Consolidate specs into one line
  const specsLine = equipment.specs?.slice(0, 3).join(' • ') || '';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
      {/* Full Bleed Image Container - Cropped & Zoomed */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted/30 to-background">
        {equipment.image_url ? (
          <img
            src={equipment.image_url}
            alt={`${equipment.brand} ${equipment.name}`}
            className="w-full h-full object-cover scale-125 transition-transform duration-500 group-hover:scale-140"
            style={{ objectPosition: 'center 40%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Category Badge - Subtle */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-background/60 backdrop-blur-sm text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {equipment.category}
        </div>
      </div>

      {/* Content Overlay - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
        <p className="text-[10px] text-primary font-medium uppercase tracking-wider">{equipment.brand}</p>
        <h3 className="font-bold text-foreground text-lg leading-tight">{equipment.name}</h3>
        {equipment.model && (
          <p className="text-sm text-muted-foreground">{equipment.model}</p>
        )}
        
        {/* Consolidated Specs Line */}
        {specsLine && (
          <p className="text-xs text-muted-foreground/80 pt-1">{specsLine}</p>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;
