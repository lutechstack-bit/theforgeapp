import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Play } from 'lucide-react';

interface PremiumCourseCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  instructorName?: string;
  companyName?: string;
  isPremium?: boolean;
  isLocked?: boolean;
  duration?: string;
  onClick?: () => void;
  className?: string;
}

export const PremiumCourseCard: React.FC<PremiumCourseCardProps> = ({
  title,
  subtitle,
  thumbnailUrl,
  instructorName,
  companyName,
  isPremium,
  isLocked,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl",
        "bg-card border border-border/30",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90" />
        
        {/* Play Button - shows on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
            isLocked ? "bg-muted/90" : "bg-primary shadow-glow"
          )}>
            {isLocked ? (
              <Lock className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Play className="h-6 w-6 text-primary-foreground ml-1" />
            )}
          </div>
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
          {subtitle && (
            <p className="text-sm text-muted-foreground italic mb-1">{subtitle}</p>
          )}
          <h3 className="font-extrabold text-foreground text-lg uppercase tracking-wide leading-tight">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-4 flex items-center justify-center gap-3 border-t border-border/30">
        <span className="text-sm text-foreground font-medium">
          {instructorName}
        </span>
        {companyName && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
            {companyName}
          </span>
        )}
        {isPremium && isLocked && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent/20 text-accent">
            Premium
          </span>
        )}
      </div>
    </div>
  );
};
