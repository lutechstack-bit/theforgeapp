import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Play, Film, Pen, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface PastProgramCardProps {
  id: string;
  name: string;
  programType: string;
  completionDate: Date;
  imageUrl?: string;
  description?: string;
  hasRecording?: boolean;
  learnContentId?: string;
  onClick?: () => void;
  className?: string;
}

export const PastProgramCard: React.FC<PastProgramCardProps> = ({
  name,
  programType,
  completionDate,
  imageUrl,
  description,
  hasRecording,
  learnContentId,
  onClick,
  className,
}) => {
  const getProgramIcon = () => {
    switch (programType) {
      case 'FORGE':
        return <Film className="h-3.5 w-3.5" />;
      case 'WRITE':
        return <Pen className="h-3.5 w-3.5" />;
      default:
        return <Play className="h-3.5 w-3.5" />;
    }
  };

  const getProgramColor = () => {
    switch (programType) {
      case 'FORGE':
        return 'bg-primary/90 text-primary-foreground';
      case 'WRITE':
        return 'bg-accent/90 text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300",
        "bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30",
        "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        "w-full flex-shrink-0",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted/50 flex items-center justify-center">
            {getProgramIcon()}
          </div>
        )}
        
        {/* Program Type Badge */}
        <div className={cn(
          "absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1",
          getProgramColor()
        )}>
          {getProgramIcon()}
          {programType}
        </div>

        {/* Watch Session / Recording Badge */}
        {(learnContentId || hasRecording) && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm flex items-center gap-1 text-xs font-medium text-foreground">
            {learnContentId ? (
              <>
                <BookOpen className="h-3 w-3 text-primary" />
                <span>Watch</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-primary" />
                <span>Recording</span>
              </>
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">
          {name}
        </h4>
        
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(completionDate, 'MMM yyyy')}</span>
        </div>
      </div>
    </div>
  );
};