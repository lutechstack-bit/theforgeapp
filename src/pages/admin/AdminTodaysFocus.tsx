import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FocusCard {
  id: string;
  title: string;
  description: string | null;
  cta_text: string;
  cta_route: string;
  icon_emoji: string | null;
  priority: number;
  auto_detect_field: string | null;
  cohort_types: string[] | null;
  is_active: boolean;
  order_index: number;
}

const ICON_OPTIONS = [
  { value: 'target', label: '🎯 Target' },
  { value: 'clipboard-list', label: '📋 Clipboard' },
  { value: 'zap', label: '⚡ Zap' },
  { value: 'star', label: '⭐ Star' },
];

const AUTO_DETECT_OPTIONS = [
  { value: '', label: 'None (always show)' },
  { value: 'ky_form_completed', label: 'KY Form Completed' },
  { value: 'profile_setup_completed', label: 'Profile Setup Completed' },
  { value: 'avatar_url', label: 'Has Avatar' },
];

export default function AdminTodaysFocus() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FocusCard | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    cta_text: 'Start Now',
    cta_route: '',
    icon_emoji: 'target',
    priority: 0,
    auto_detect_field: '',
    cohort_types: [] as string[],
    is_active: true,
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ['admin-focus-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('today_focus_cards')
        .select('*')
        .order('priority', { ascending: false })
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as FocusCard[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCard) {
        const { error } = await supabase
          .from('today_focus_cards')
          .update(data)
          .eq('id', editingCard.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('today_focus_cards').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-focus-cards'] });
      queryClient.invalidateQueries({ queryKey: ['today-focus-cards'] });
      setIsDialogOpen(false);
      setEditingCard(null);
      toast.success(editingCard ? 'Card updated' : 'Card created');
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('today_focus_cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-focus-cards'] });
      toast.success('Card deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('today_focus_cards')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-focus-cards'] });
      queryClient.invalidateQueries({ queryKey: ['today-focus-cards'] });
    },
  });

  const openCreate = () => {
    setEditingCard(null);
    setForm({
      title: '',
      description: '',
      cta_text: 'Start Now',
      cta_route: '',
      icon_emoji: 'target',
      priority: 0,
      auto_detect_field: '',
      cohort_types: [],
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (card: FocusCard) => {
    setEditingCard(card);
    setForm({
      title: card.title,
      description: card.description || '',
      cta_text: card.cta_text,
      cta_route: card.cta_route,
      icon_emoji: card.icon_emoji || 'target',
      priority: card.priority,
      auto_detect_field: card.auto_detect_field || '',
      cohort_types: card.cohort_types || [],
      is_active: card.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.cta_route) {
      toast.error('Title and route are required');
      return;
    }
    saveMutation.mutate({
      title: form.title,
      description: form.description || null,
      cta_text: form.cta_text,
      cta_route: form.cta_route,
      icon_emoji: form.icon_emoji,
      priority: form.priority,
      auto_detect_field: form.auto_detect_field || null,
      cohort_types: form.cohort_types.length > 0 ? form.cohort_types : null,
      is_active: form.is_active,
    });
  };

  const toggleCohort = (type: string) => {
    setForm((prev) => ({
      ...prev,
      cohort_types: prev.cohort_types.includes(type)
        ? prev.cohort_types.filter((t) => t !== type)
        : [...prev.cohort_types, type],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Today's Focus Cards</h1>
          <p className="text-muted-foreground mt-1">
            Smart priority cards shown on the homepage
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      <div className="space-y-4">
        {cards?.map((card) => (
          <Card key={card.id} className="bg-card/50 border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{card.title}</p>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    Priority: {card.priority}
                  </span>
                  {card.auto_detect_field && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Auto: {card.auto_detect_field}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Route: {card.cta_route}
                  </span>
                  {card.cohort_types && (
                    <span className="text-xs text-muted-foreground">
                      Cohorts: {card.cohort_types.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={card.is_active}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: card.id, is_active: checked })
                  }
                />
                <Button size="icon" variant="ghost" onClick={() => openEdit(card)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Delete this focus card?')) {
                      deleteMutation.mutate(card.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!cards || cards.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            No focus cards yet. Click "Add Card" to create one.
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Focus Card' : 'Create Focus Card'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Complete your Filmmaker Profile"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell us about your filmmaking journey"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">CTA Text</label>
                <Input
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">CTA Route</label>
                <Input
                  value={form.cta_route}
                  onChange={(e) => setForm({ ...form, cta_route: e.target.value })}
                  placeholder="/kyf-form"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Icon</label>
                <Select
                  value={form.icon_emoji}
                  onValueChange={(v) => setForm({ ...form, icon_emoji: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Auto-Detect Field</label>
              <Select
                value={form.auto_detect_field}
                onValueChange={(v) => setForm({ ...form, auto_detect_field: v })}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {AUTO_DETECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value || 'none'} value={opt.value || 'none'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Cohort Types</label>
              <div className="flex gap-2">
                {['FORGE', 'FORGE_CREATORS', 'FORGE_WRITING'].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleCohort(type)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      form.cohort_types.includes(type)
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'bg-secondary border-border text-muted-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {editingCard ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
