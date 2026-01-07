import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sparkles, Film } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  slug: string;
}

interface ProgramTabsProps {
  programs: Program[];
  selectedProgramId: string | null;
  onSelectProgram: (programId: string | null) => void;
  showBFPFilter?: boolean;
  className?: string;
}

export const ProgramTabs: React.FC<ProgramTabsProps> = ({
  programs,
  selectedProgramId,
  onSelectProgram,
  className,
}) => {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onSelectProgram(null)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
            selectedProgramId === null
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
          )}
        >
          <Film className="h-4 w-4" />
          All Sessions
        </button>
        
        {programs.map((program) => (
          <button
            key={program.id}
            onClick={() => onSelectProgram(program.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
              selectedProgramId === program.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
            )}
          >
            <Sparkles className="h-4 w-4" />
            {program.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
