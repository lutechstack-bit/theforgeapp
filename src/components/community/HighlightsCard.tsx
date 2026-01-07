import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Trophy, Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Highlight {
  id: string;
  highlight_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  highlight_date: string;
  is_pinned: boolean;
}

export const HighlightsCard: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('highlights-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_highlights',
        },
        () => {
          fetchHighlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('community_highlights')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('highlight_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'achievement':
        return <Star className="w-4 h-4 text-primary" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Community Highlights</h3>
      </div>

      {highlights.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No highlights yet. Stay tuned for community milestones!
        </p>
      ) : (
        <div className="space-y-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="flex gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                {getIcon(highlight.highlight_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-foreground line-clamp-1">
                    {highlight.title}
                  </p>
                  {highlight.is_pinned && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                      Pinned
                    </span>
                  )}
                </div>
                {highlight.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {highlight.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(highlight.highlight_date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
