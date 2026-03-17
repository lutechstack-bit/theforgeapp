import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check, X, Plus, Trash2, Image } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  is_visible: boolean;
  order_index: number;
  cohort_types: string[] | null;
}

interface HeroSlide {
  id: string;
  image_url: string;
  cohort_type: string | null;
  is_active: boolean | null;
  order_index: number | null;
}

// ─── Hero Slides Manager ───
function HeroSlidesManager() {
  const queryClient = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState<string>('FORGE');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCohortType, setNewCohortType] = useState<string>('FORGE');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);

  const { data: slides, isLoading } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_hero_slides')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const filteredSlides = slides?.filter(s =>
    selectedCohort === 'ALL' ? true : s.cohort_type === selectedCohort
  );

  const insertSlide = async (imageUrl: string) => {
    const maxOrder = slides?.reduce((max, s) => Math.max(max, s.order_index || 0), -1) ?? -1;
    const { error } = await supabase
      .from('homepage_hero_slides')
      .insert({
        image_url: imageUrl,
        cohort_type: newCohortType,
        order_index: maxOrder + 1,
      });
    if (error) throw error;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const filePath = `hero-slides/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);
      await insertSlide(urlData.publicUrl);
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast.success('Slide uploaded & added');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!newImageUrl.trim()) throw new Error('Image URL is required');
      await insertSlide(newImageUrl.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      setNewImageUrl('');
      toast.success('Slide added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('homepage_hero_slides')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast.success('Slide updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_hero_slides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast.success('Slide deleted');
    },
  });

  const updateCohortMutation = useMutation({
    mutationFn: async ({ id, cohort_type }: { id: string; cohort_type: string }) => {
      const { error } = await supabase
        .from('homepage_hero_slides')
        .update({ cohort_type })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast.success('Cohort updated');
    },
  });

  const cohortLabel: Record<string, string> = {
    FORGE: 'Filmmaking',
    FORGE_WRITING: 'Writing',
    FORGE_CREATORS: 'Creators',
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="w-5 h-5" /> Hero Carousel Slides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter by cohort */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['ALL', 'FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'].map(c => (
            <Button
              key={c}
              size="sm"
              variant={selectedCohort === c ? 'default' : 'outline'}
              onClick={() => setSelectedCohort(c)}
              className="text-xs"
            >
              {c === 'ALL' ? 'All' : cohortLabel[c]}
            </Button>
          ))}
        </div>

        {/* Add new slide */}
        <div className="flex items-end gap-3 p-4 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Image URL</label>
            <Input
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="https://... (recommended: 1200×800px)"
              className="h-9"
            />
          </div>
          <div className="w-40 space-y-1">
            <label className="text-xs text-muted-foreground">Cohort</label>
            <Select value={newCohortType} onValueChange={setNewCohortType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FORGE">Filmmaking</SelectItem>
                <SelectItem value="FORGE_WRITING">Writing</SelectItem>
                <SelectItem value="FORGE_CREATORS">Creators</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={() => addMutation.mutate()}
            disabled={!newImageUrl.trim() || addMutation.isPending}
            className="gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {/* Slides list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : filteredSlides?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No slides found</p>
        ) : (
          <div className="space-y-2">
            {filteredSlides?.map(slide => (
              <div
                key={slide.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border transition-all',
                  slide.is_active ? 'border-border/50 bg-card/30' : 'border-border/20 bg-muted/20 opacity-60'
                )}
              >
                {/* Thumbnail */}
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-24 h-16 object-cover rounded-md border border-border/30 flex-shrink-0"
                />

                {/* URL */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{slide.image_url}</p>
                </div>

                {/* Cohort selector */}
                <Select
                  value={slide.cohort_type || 'FORGE'}
                  onValueChange={(val) => updateCohortMutation.mutate({ id: slide.id, cohort_type: val })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORGE">Filmmaking</SelectItem>
                    <SelectItem value="FORGE_WRITING">Writing</SelectItem>
                    <SelectItem value="FORGE_CREATORS">Creators</SelectItem>
                  </SelectContent>
                </Select>

                {/* Toggle & Delete */}
                <Switch
                  checked={slide.is_active ?? true}
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: slide.id, is_active: checked })}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(slide.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section Order Manager ───
function SectionOrderManager() {
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
      const { error } = await supabase.from('homepage_sections').update({ is_visible }).eq('id', id);
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
      const { error } = await supabase.from('homepage_sections').update({ title, subtitle }).eq('id', id);
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
        const { error } = await supabase.from('homepage_sections').update({ order_index: section.order_index }).eq('id', section.id);
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
    reorderMutation.mutate(newSections.map((s, i) => ({ id: s.id, order_index: i })));
  };

  const startEditing = (section: HomepageSection) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditSubtitle(section.subtitle || '');
  };

  const saveEditing = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, title: editTitle, subtitle: editSubtitle || null });
  };

  const sectionIcons: Record<string, string> = {
    countdown: '⏱️', todays_focus: '🎯', onboarding: '📋', journey: '🗺️',
    batchmates: '👥', mentors: '🎓', alumni: '🎬', travel_stay: '🏠',
  };

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader><CardTitle className="text-lg">Section Order</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {sections?.map((section, index) => (
          <div
            key={section.id}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-all',
              section.is_visible ? 'border-border/50 bg-card/30' : 'border-border/20 bg-muted/20 opacity-60'
            )}
          >
            <div className="flex flex-col gap-1">
              <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
              <button onClick={() => moveSection(index, 'down')} disabled={index === (sections?.length || 0) - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
            </div>
            <span className="text-2xl flex-shrink-0">{sectionIcons[section.section_key] || '📦'}</span>
            <div className="flex-1 min-w-0">
              {editingId === section.id ? (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Section title" className="h-8" />
                  <Input value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)} placeholder="Subtitle (optional)" className="h-8" />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-foreground">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.subtitle || section.section_key}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {editingId === section.id ? (
                <>
                  <Button size="icon" variant="ghost" onClick={saveEditing} className="h-8 w-8"><Check className="w-4 h-4 text-primary" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => startEditing(section)} className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
              )}
              <Switch checked={section.is_visible} onCheckedChange={(checked) => toggleMutation.mutate({ id: section.id, is_visible: checked })} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───
export default function AdminHomepage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Homepage Layout</h1>
        <p className="text-muted-foreground mt-1">Manage hero carousel and homepage sections</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
          <TabsTrigger value="sections">Section Order</TabsTrigger>
        </TabsList>
        <TabsContent value="hero"><HeroSlidesManager /></TabsContent>
        <TabsContent value="sections"><SectionOrderManager /></TabsContent>
      </Tabs>
    </div>
  );
}
