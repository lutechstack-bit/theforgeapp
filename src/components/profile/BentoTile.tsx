import React from 'react';
import { cn } from '@/lib/utils';

interface BentoTileProps {
  label: string;
  icon: string;
  className?: string;
  onEdit?: () => void;
  animationDelay?: number;
  children: React.ReactNode;
}

export const BentoTile: React.FC<BentoTileProps> = ({
  label,
  icon,
  className,
  onEdit,
  animationDelay = 0,
  children,
}) => {
  return (
    <div
      className={cn(
        'bg-card border border-primary/10 rounded-[14px] overflow-hidden transition-all duration-250 relative flex flex-col',
        'hover:border-primary/25 hover:-translate-y-px',
        'bento-tile-animate',
        className
      )}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-primary/10 flex-shrink-0">
        <span className="font-mono text-[8.5px] tracking-[2.5px] uppercase text-muted-foreground flex items-center gap-2">
          <span className="text-primary text-[11px]">{icon}</span>
          {label}
        </span>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-muted-foreground text-[13px] px-1.5 py-0.5 rounded-md transition-all hover:text-primary hover:bg-primary/10 cursor-pointer"
          >
            ✎
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 flex-1 overflow-hidden flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};
