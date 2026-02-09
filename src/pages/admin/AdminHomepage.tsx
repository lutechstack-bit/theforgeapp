import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { GripVertical, Eye, EyeOff, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  is_visible: boolean;
  order_index: number;
  cohort_types: string[] | null;
}

export default function AdminHomepage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');

  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast.success('Section visibility updated');
    },
    onError: () => toast.error('Failed to update section'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, subtitle }: { id: string; title: string; subtitle: string | null }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ title, subtitle })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      setEditingId(null);
      toast.success('Section updated');
    },
    onError: () => toast.error('Failed to update section'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections: { id: string; order_index: number }[]) => {
      for (const section of reorderedSections) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({ order_index: section.order_index })
          .eq('id', section.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to reorder'),
  });

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!sections) return;
    const newSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];

    const reordered = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    reorderMutation.mutate(reordered);
  };

  const startEditing = (section: HomepageSection) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditSubtitle(section.subtitle || '');
  };

  const saveEditing = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      title: editTitle,
      subtitle: editSubtitle || null,
    });
  };

  const sectionIcons: Record<string, string> = {
    countdown: '⏱️',
    todays_focus: '🎯',
    onboarding: '📋',
    journey: '🗺️',
    batchmates: '👥',
    mentors: '🎓',
    alumni: '🎬',
    travel_stay: '🏠',
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Homepage Layout</h1>
        <p className="text-muted-foreground mt-1">
          Reorder, rename, and toggle visibility of homepage sections
        </p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Section Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections?.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border transition-all',
                section.is_visible
                  ? 'border-border/50 bg-card/30'
                  : 'border-border/20 bg-muted/20 opacity-60'
              )}
            >
              {/* Reorder */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === (sections?.length || 0) - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                >
                  ▼
                </button>
              </div>

              {/* Icon */}
              <span className="text-2xl flex-shrink-0">
                {sectionIcons[section.section_key] || '📦'}
              </span>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                {editingId === section.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Section title"
                      className="h-8"
                    />
                    <Input
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      placeholder="Subtitle (optional)"
                      className="h-8"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">{section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.subtitle || section.section_key}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {editingId === section.id ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={saveEditing}
                      className="h-8 w-8"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEditing(section)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}

                <Switch
                  checked={section.is_visible}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: section.id, is_visible: checked })
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
