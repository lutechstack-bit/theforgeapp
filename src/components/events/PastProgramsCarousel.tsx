import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PastProgramCard } from './PastProgramCard';
import { Award } from 'lucide-react';

interface PastProgram {
  id: string;
  name: string;
  program_type: string;
  completion_date: string;
  image_url?: string;
  description?: string;
  recording_url?: string;
}

interface PastProgramsCarouselProps {
  programs: PastProgram[];
  onProgramClick?: (program: PastProgram) => void;
  className?: string;
}

export const PastProgramsCarousel: React.FC<PastProgramsCarouselProps> = ({
  programs,
  onProgramClick,
  className,
}) => {
  if (!programs.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-1">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Past Programs</h3>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {programs.map((program) => (
            <PastProgramCard
              key={program.id}
              id={program.id}
              name={program.name}
              programType={program.program_type}
              completionDate={new Date(program.completion_date)}
              imageUrl={program.image_url}
              description={program.description}
              hasRecording={!!program.recording_url}
              onClick={() => onProgramClick?.(program)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
