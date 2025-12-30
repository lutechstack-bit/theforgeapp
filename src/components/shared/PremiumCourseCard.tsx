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
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500",
        "glass-card-hover",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted/50" />
        )}
        
        {/* Premium Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-90" />
        
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        
        {/* Play Button - shows on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md",
            isLocked 
              ? "bg-muted/80 border border-border/50" 
              : "bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.5)] border border-primary/30"
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
          <h3 className="font-extrabold text-foreground text-lg uppercase tracking-wide leading-tight drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Footer Info with Glass Effect */}
      <div className="px-4 py-4 flex items-center justify-center gap-3 glass border-t border-border/20">
        <span className="text-sm text-foreground font-medium">
          {instructorName}
        </span>
        {companyName && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20 backdrop-blur-sm">
            {companyName}
          </span>
        )}
        {isPremium && isLocked && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/20 backdrop-blur-sm">
            Premium
          </span>
        )}
      </div>
    </div>
  );
};
