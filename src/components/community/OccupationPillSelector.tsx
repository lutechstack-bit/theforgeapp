import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OccupationPillSelectorProps {
  selected: string[];
  onChange: (occupations: string[]) => void;
  max?: number;
}

export const OccupationPillSelector: React.FC<OccupationPillSelectorProps> = ({
  selected,
  onChange,
  max = 4,
}) => {
  const { data: occupations = [] } = useQuery({
    queryKey: ['collaborator-occupations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborator_occupations')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      return data || [];
    },
  });

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else if (selected.length < max) {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {occupations.map((occ) => {
          const isSelected = selected.includes(occ.name);
          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => toggle(occ.name)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/30 hover:border-border/60'
              )}
            >
              {occ.name}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">{selected.length}/{max} selected</p>
    </div>
  );
};
