import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Highlight {
  id: string;
  highlight_type: string;
  title: string;
  description: string | null;
  highlight_date: string;
  is_pinned: boolean;
}

export const CompactHighlights: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    fetchHighlights();
    const channel = supabase.channel('highlights-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'community_highlights' }, fetchHighlights).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchHighlights = async () => {
    const { data } = await supabase.from('community_highlights').select('*').order('is_pinned', { ascending: false }).order('highlight_date', { ascending: false }).limit(3);
    setHighlights(data || []);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
      case 'achievement': return <Star className="w-3.5 h-3.5 text-primary" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  if (highlights.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Highlights</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {highlights.map((h) => (
          <div key={h.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30 shrink-0 min-w-[180px] max-w-[220px]">
            <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center shrink-0">
              {getIcon(h.highlight_type)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{h.title}</p>
              <p className="text-[10px] text-muted-foreground">{format(new Date(h.highlight_date), 'MMM d')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
