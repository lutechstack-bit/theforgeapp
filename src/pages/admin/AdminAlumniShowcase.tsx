import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/admin/FileUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Film, Play, Image } from 'lucide-react';

interface AlumniShowcaseForm {
  title: string;
  author_name: string;
  cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
  media_type: 'video' | 'image' | 'reel';
  media_url: string;
  thumbnail_url: string;
  redirect_url: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

const initialShowcaseForm: AlumniShowcaseForm = {
  title: '',
  author_name: '',
  cohort_type: 'FORGE',
  media_type: 'video',
  media_url: '',
  thumbnail_url: '',
  redirect_url: '',
  description: '',
  order_index: 0,
  is_active: true,
};

const cohortMediaDefaults: Record<string, 'video' | 'image' | 'reel'> = {
  FORGE: 'video',
  FORGE_WRITING: 'image',
  FORGE_CREATORS: 'reel',
};

const AdminAlumniShowcase: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AlumniShowcaseForm>(initialShowcaseForm);
  const [subTab, setSubTab] = useState<'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS'>('FORGE');

  const { data: showcaseItems = [], isLoading } = useQuery({
    queryKey: ['admin-alumni-showcase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni_showcase')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AlumniShowcaseForm) => {
      if (editingId) {
        const { error } = await supabase.from('alumni_showcase').update(data).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('alumni_showcase').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-showcase'] });
      queryClient.invalidateQueries({ queryKey: ['alumni-showcase'] });
      toast.success(editingId ? 'Showcase updated' : 'Showcase item created');
      resetForm();
    },
    onError: (error) => toast.error('Failed to save: ' + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alumni_showcase').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-showcase'] });
      queryClient.invalidateQueries({ queryKey: ['alumni-showcase'] });
      toast.success('Showcase item deleted');
    },
    onError: (error) => toast.error('Failed to delete: ' + error.message),
  });

  const resetForm = () => {
    setForm(initialShowcaseForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setForm({
      title: item.title || '',
      author_name: item.author_name || '',
      cohort_type: item.cohort_type || 'FORGE',
      media_type: item.media_type || 'video',
      media_url: item.media_url || '',
      thumbnail_url: item.thumbnail_url || '',
      redirect_url: item.redirect_url || '',
      description: item.description || '',
      order_index: item.order_index || 0,
      is_active: item.is_active ?? true,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author_name.trim()) {
      toast.error('Title and Author Name are required');
      return;
    }
    saveMutation.mutate(form);
  };

  const filteredShowcase = showcaseItems.filter((s: any) => s.cohort_type === subTab);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alumni Showcase</h1>
          <p className="text-muted-foreground">Manage showcase items for all cohorts</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 rounded-full bg-card border border-border/30 w-fit">
            {(['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  subTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'FORGE' ? 'Filmmaking' : tab === 'FORGE_WRITING' ? 'Writing' : 'Creators'}
              </button>
            ))}
          </div>
          <Button onClick={() => {
            resetForm();
            setForm({ ...initialShowcaseForm, cohort_type: subTab, media_type: cohortMediaDefaults[subTab] });
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading showcase...</div>
        ) : filteredShowcase.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No showcase items yet</h3>
            <p className="text-muted-foreground mb-4">
              Add {subTab === 'FORGE' ? 'videos' : subTab === 'FORGE_WRITING' ? 'images' : 'reels'} for this cohort
            </p>
            <Button onClick={() => {
              resetForm();
              setForm({ ...initialShowcaseForm, cohort_type: subTab, media_type: cohortMediaDefaults[subTab] });
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredShowcase.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                {item.media_url || item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.title}
                    className={`rounded-lg object-cover flex-shrink-0 ${
                      item.media_type === 'image' ? 'w-16 h-24' : item.media_type === 'reel' ? 'w-14 h-24' : 'w-32 h-20'
                    }`}
                  />
                ) : (
                  <div className="w-32 h-20 rounded-lg flex-shrink-0 flex items-center justify-center bg-secondary">
                    {item.media_type === 'image' ? <Image className="h-6 w-6 text-muted-foreground" /> : <Play className="h-6 w-6 text-muted-foreground" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    {!item.is_active && (
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">Hidden</span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs capitalize">{item.media_type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">by {item.author_name}</p>
                  {item.description && <p className="text-xs text-muted-foreground truncate mt-1">{item.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this showcase item?')) deleteMutation.mutate(item.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Showcase Item' : 'Add Showcase Item'}</DialogTitle>
            <DialogDescription>
              {form.media_type === 'image' ? 'Upload an image for the writing showcase' : 'Add a video/reel for the showcase'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sc_title">Title *</Label>
                <Input id="sc_title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ocean Eyes, Starry Skies" required />
              </div>
              <div>
                <Label htmlFor="sc_author">Author Name *</Label>
                <Input id="sc_author" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="e.g. Ishwariya" required />
              </div>
              <div>
                <Label htmlFor="sc_description">Description</Label>
                <Input id="sc_description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional subtitle or achievement" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cohort Type</Label>
                  <Select value={form.cohort_type} onValueChange={(v) => {
                    const ct = v as 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
                    setForm({ ...form, cohort_type: ct, media_type: cohortMediaDefaults[ct] });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FORGE">Filmmaking</SelectItem>
                      <SelectItem value="FORGE_WRITING">Writing</SelectItem>
                      <SelectItem value="FORGE_CREATORS">Creators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Media Type</Label>
                  <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v as 'video' | 'image' | 'reel' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video (Landscape)</SelectItem>
                      <SelectItem value="image">Image (Portrait)</SelectItem>
                      <SelectItem value="reel">Reel (Vertical Video)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <FileUpload
                bucket="learn-thumbnails"
                accept={form.media_type === 'image' ? 'image/*' : 'image/*,video/*'}
                maxSizeMB={form.media_type === 'image' ? 10 : 100}
                label={form.media_type === 'image' ? 'Image' : 'Media / Thumbnail'}
                helperText={form.media_type === 'image' ? 'Upload a portrait image (book cover style)' : 'Upload a thumbnail image for the video'}
                currentUrl={form.media_type === 'image' ? form.media_url : form.thumbnail_url}
                onUploadComplete={(url) => {
                  if (form.media_type === 'image') {
                    setForm(prev => ({ ...prev, media_url: url }));
                  } else {
                    setForm(prev => ({ ...prev, thumbnail_url: url }));
                  }
                }}
              />

              {form.media_type !== 'image' && (
                <div>
                  <Label htmlFor="sc_media_url">Video URL (YouTube/Vimeo embed)</Label>
                  <Input
                    id="sc_media_url"
                    value={form.media_url}
                    onChange={(e) => setForm({ ...form, media_url: e.target.value, thumbnail_url: '' })}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Changing this will auto-clear the thumbnail so a fresh one is derived</p>
                </div>
              )}

              <div>
                <Label htmlFor="sc_redirect">Redirect URL (optional)</Label>
                <Input id="sc_redirect" value={form.redirect_url} onChange={(e) => setForm({ ...form, redirect_url: e.target.value })} placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sc_order">Display Order</Label>
                  <Input id="sc_order" type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} min={0} />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Switch id="sc_active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                  <Label htmlFor="sc_active" className="font-medium">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAlumniShowcase;
