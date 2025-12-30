import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Video, Gift, Home, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminContent() {
  // Fetch content counts
  const { data: counts, isLoading } = useQuery({
    queryKey: ['admin-content-counts'],
    queryFn: async () => {
      const [homeCards, learnContent, perks, events] = await Promise.all([
        supabase.from('home_cards').select('id', { count: 'exact' }),
        supabase.from('learn_content').select('id', { count: 'exact' }),
        supabase.from('perks').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' })
      ]);

      return {
        homeCards: homeCards.count || 0,
        learnContent: learnContent.count || 0,
        perks: perks.count || 0,
        events: events.count || 0
      };
    }
  });

  const contentTypes = [
    { 
      title: 'Home Cards', 
      count: counts?.homeCards || 0, 
      icon: Home, 
      description: 'Cards displayed on the home screen',
      color: 'text-primary',
      bg: 'bg-primary/20'
    },
    { 
      title: 'Learn Content', 
      count: counts?.learnContent || 0, 
      icon: Video, 
      description: 'Videos and learning resources',
      color: 'text-purple-500',
      bg: 'bg-purple-500/20'
    },
    { 
      title: 'Perks', 
      count: counts?.perks || 0, 
      icon: Gift, 
      description: 'Partner perks and benefits',
      color: 'text-amber-500',
      bg: 'bg-amber-500/20'
    },
    { 
      title: 'Events', 
      count: counts?.events || 0, 
      icon: FileText, 
      description: 'Community events',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/20'
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Content</h1>
        <p className="text-muted-foreground mt-1">Manage app content and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentTypes.map((type) => (
          <Card key={type.title} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-3 rounded-lg ${type.bg}`}>
                <type.icon className={`w-6 h-6 ${type.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{type.count}</div>
              <p className="text-sm text-muted-foreground">items</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-card/50 border-border/50">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Content management features coming soon. For now, content can be managed directly in the database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
