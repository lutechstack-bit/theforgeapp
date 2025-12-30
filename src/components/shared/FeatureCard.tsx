import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  imageUrl?: string;
  badge?: string;
  isPinned?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  imageUrl,
  badge,
  isPinned,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300",
        "hover:border-primary/30 hover:shadow-glow cursor-pointer",
        isPinned && "border-primary/50 bg-gradient-to-br from-card to-primary/5",
        className
      )}
    >
      {isPinned && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
          Pinned
        </div>
      )}
      
      {badge && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
          {badge}
        </div>
      )}

      {imageUrl && (
        <div className="mb-4 -mx-4 -mt-4 h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {Icon && (
        <div className="mb-3 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}

      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
};
