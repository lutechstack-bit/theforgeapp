import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

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
    <div className="relative glass-premium rounded-3xl overflow-hidden mb-6">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        {/* Image */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] flex items-center justify-center">
          {equipment.image_url ? (
            <img
              src={equipment.image_url}
              alt={`${equipment.brand} ${equipment.name}`}
              className="w-full h-full object-contain drop-shadow-2xl animate-float"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Featured Gear</span>
          </div>

          {/* Brand & Model */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{equipment.brand}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{equipment.name}</h2>
            {equipment.model && (
              <p className="text-lg text-primary font-medium">{equipment.model}</p>
            )}
          </div>

          {/* Description */}
          {equipment.description && (
            <p className="text-muted-foreground">{equipment.description}</p>
          )}

          {/* Specs */}
          {equipment.specs && equipment.specs.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {equipment.specs.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm text-foreground"
                >
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
