import React from 'react';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface CityCardProps {
  name: string;
  imageUrl?: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CityCard: React.FC<CityCardProps> = ({
  name,
  imageUrl,
  isSelected,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300",
        "min-w-[120px] h-[160px] flex-shrink-0",
        "hover:scale-105",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      
      {/* City Icon & Name */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-foreground/80" />
        </div>
        <h4 className="font-semibold text-foreground text-sm">{name}</h4>
      </div>
    </div>
  );
};
