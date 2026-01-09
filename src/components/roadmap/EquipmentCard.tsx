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

const categoryColors: Record<string, string> = {
  camera: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  lens: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  audio: 'bg-green-500/20 text-green-400 border-green-500/30',
  lighting: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  grip: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  software: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const Icon = categoryIcons[equipment.category] || Package;
  const colorClass = categoryColors[equipment.category] || 'bg-muted text-muted-foreground border-border';

  return (
    <div className="group glass-card-hover rounded-2xl overflow-hidden">
      {/* Image Container */}
      <div className="aspect-square bg-gradient-to-br from-muted/50 to-background p-6 flex items-center justify-center relative overflow-hidden">
        {equipment.image_url ? (
          <img
            src={equipment.image_url}
            alt={`${equipment.brand} ${equipment.name}`}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
          {equipment.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{equipment.brand}</p>
          <h3 className="font-semibold text-foreground line-clamp-1">{equipment.name}</h3>
          {equipment.model && (
            <p className="text-sm text-muted-foreground">{equipment.model}</p>
          )}
        </div>

        {equipment.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{equipment.description}</p>
        )}

        {/* Specs Pills */}
        {equipment.specs && equipment.specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {equipment.specs.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;
