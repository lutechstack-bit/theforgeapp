import React from 'react';
import { Camera, Sparkles, Star, Zap } from 'lucide-react';

interface EquipmentHeroCardProps {
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

const EquipmentHeroCard: React.FC<EquipmentHeroCardProps> = ({ equipment }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 border border-[#FFBF00]/20 bg-card">
      
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        {/* Image Container */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] flex items-center justify-center relative">
          {/* Subtle circular backdrop */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-muted/20 to-muted/5 blur-2xl" />
          
          {equipment.image_url ? (
            <img
              src={equipment.image_url}
              alt={`${equipment.brand} ${equipment.name}`}
              className="w-full h-full object-contain drop-shadow-2xl relative z-10 animate-float"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
          {/* Featured Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Featured Gear</span>
          </div>

          {/* Brand & Model */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">{equipment.brand}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{equipment.name}</h2>
            {equipment.model && (
              <p className="text-xl text-primary font-semibold">{equipment.model}</p>
            )}
          </div>

          {/* Description */}
          {equipment.description && (
            <p className="text-muted-foreground leading-relaxed">{equipment.description}</p>
          )}

          {/* Specs Grid */}
          {equipment.specs && equipment.specs.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
              {equipment.specs.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-sm font-medium text-foreground"
                >
                  <Zap className="w-3 h-3 text-primary" />
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentHeroCard;
