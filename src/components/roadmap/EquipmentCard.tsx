import React from 'react';
import { Camera, Aperture, Mic, Lightbulb, Video, Code, Package, Info } from 'lucide-react';

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

const categoryColors: Record<string, string> = {
  camera: 'from-red-500/20 to-orange-500/20',
  lens: 'from-blue-500/20 to-cyan-500/20',
  audio: 'from-green-500/20 to-emerald-500/20',
  lighting: 'from-yellow-500/20 to-amber-500/20',
  grip: 'from-purple-500/20 to-violet-500/20',
  software: 'from-pink-500/20 to-rose-500/20',
};

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const Icon = categoryIcons[equipment.category] || Package;
  const gradientClass = categoryColors[equipment.category] || 'from-muted/30 to-background';
  
  // Consolidate specs into one line
  const specsLine = equipment.specs?.slice(0, 3).join(' • ') || '';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1">
      {/* Product Image Container - Clean White/Light Background */}
      <div className={`aspect-square relative overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {/* Subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-transparent to-background/80" />
        
        {equipment.image_url ? (
          <div className="w-full h-full flex items-center justify-center p-6">
            <img
              src={equipment.image_url}
              alt={`${equipment.brand} ${equipment.name}`}
              className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-6 rounded-full bg-muted/30">
              <Icon className="w-12 h-12 text-muted-foreground/50" />
            </div>
          </div>
        )}
        
        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-xs font-medium text-muted-foreground">
          <Icon className="w-3 h-3" />
          <span className="uppercase tracking-wider">{equipment.category}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2 bg-gradient-to-b from-card to-card/80">
        {/* Brand */}
        <p className="text-[11px] text-primary font-semibold uppercase tracking-widest">{equipment.brand}</p>
        
        {/* Name */}
        <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
          {equipment.name}
        </h3>
        
        {/* Model */}
        {equipment.model && (
          <p className="text-sm text-muted-foreground font-medium">{equipment.model}</p>
        )}
        
        {/* Specs Pills */}
        {equipment.specs && equipment.specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {equipment.specs.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground border border-border/30"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/0 group-hover:ring-primary/20 transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default EquipmentCard;
