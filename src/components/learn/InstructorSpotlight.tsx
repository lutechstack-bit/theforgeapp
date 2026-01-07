import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Award } from 'lucide-react';

interface InstructorSpotlightProps {
  name: string;
  avatar?: string;
  bio?: string;
  programName?: string;
  thumbnailUrl?: string;
  onViewProgram?: () => void;
  className?: string;
}

export const InstructorSpotlight: React.FC<InstructorSpotlightProps> = ({
  name,
  avatar,
  bio,
  programName,
  thumbnailUrl,
  onViewProgram,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-card via-card to-primary/5",
        "border border-border/50",
        className
      )}
    >
      {/* Background Image */}
      {thumbnailUrl && (
        <div className="absolute inset-0">
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>
      )}

      {/* Glow Effects */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
        {/* Instructor Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <AvatarImage src={avatar} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary shadow-lg">
            <Award className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            {programName && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20 mb-2">
                Featured Instructor
              </span>
            )}
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {name}
            </h3>
            {programName && (
              <p className="text-muted-foreground mt-1">{programName}</p>
            )}
          </div>

          {bio && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none max-w-2xl">
              {bio}
            </p>
          )}

          {onViewProgram && (
            <Button
              onClick={onViewProgram}
              className="gap-2 rounded-full bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Play className="h-4 w-4" />
              View Program
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
