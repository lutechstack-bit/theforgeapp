import React from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface OccupationPillSelectorProps {
  selected: string[];
  onChange: (occupations: string[]) => void;
  maxSelections?: number;
}

export const OccupationPillSelector: React.FC<OccupationPillSelectorProps> = ({
  selected,
  onChange,
  maxSelections = 4,
}) => {
  const { data: occupations, isLoading } = useQuery({
    queryKey: ['collaborator-occupations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborator_occupations')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((o) => o !== name));
    } else if (selected.length < maxSelections) {
      onChange([...selected, name]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(occupations || []).map((occ) => {
          const isSelected = selected.includes(occ.name);
          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => toggle(occ.name)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground'
              )}
            >
              {occ.name}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {selected.length}/{maxSelections} selected
      </p>
    </div>
  );
};
