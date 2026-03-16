import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/admin/FileUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink, Image } from 'lucide-react';

interface ExploreProgramForm {
  title: string;
  description: string;
  label: string;
  image_url: string;
  redirect_url: string;
  gradient: string;
  program_tab: 'online' | 'offline';
  order_index: number;
  is_active: boolean;
}

const initialForm: ExploreProgramForm = {
  title: '',
  description: '',
  label: '',
  image_url: '',
  redirect_url: '',
  gradient: '',
  program_tab: 'online',
  order_index: 0,
  is_active: true,
};

const AdminExplorePrograms: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExploreProgramForm>(initialForm);
  const [subTab, setSubTab] = useState<'online' | 'offline'>('online');

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['admin-explore-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('explore_programs').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ExploreProgramForm) => {
      if (editingId) {
        const { error } = await supabase.from('explore_programs').update(data).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('explore_programs').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-explore-programs'] });
      queryClient.invalidateQueries({ queryKey: ['explore-programs'] });
      toast.success(editingId ? 'Program updated' : 'Program created');
      resetForm();
    },
    onError: (error) => toast.error('Failed to save: ' + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('explore_programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-explore-programs'] });
      queryClient.invalidateQueries({ queryKey: ['explore-programs'] });
      toast.success('Program deleted');
    },
    onError: (error) => toast.error('Failed to delete: ' + error.message),
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      label: item.label || '',
      image_url: item.image_url || '',
      redirect_url: item.redirect_url || '',
      gradient: item.gradient || '',
      program_tab: item.program_tab || 'online',
      order_index: item.order_index || 0,
      is_active: item.is_active ?? true,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    saveMutation.mutate(form);
  };

  const filteredPrograms = programs.filter(p => p.program_tab === subTab);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Explore Programs</h1>
          <p className="text-muted-foreground">Manage program banners shown on the Learn page</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 rounded-full bg-card border border-border/30 w-fit">
            {(['online', 'offline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  subTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'online' ? 'Online Programs' : 'Offline Residencies'}
              </button>
            ))}
          </div>
          <Button onClick={() => { resetForm(); setForm({ ...initialForm, program_tab: subTab }); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading programs...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No programs yet</h3>
            <p className="text-muted-foreground mb-4">Add your first {subTab} program banner</p>
            <Button onClick={() => { resetForm(); setForm({ ...initialForm, program_tab: subTab }); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                {program.image_url ? (
                  <img src={program.image_url} alt={program.title} className="w-32 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-32 h-20 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: program.gradient || 'hsl(var(--secondary))' }}>
                    <Image className="h-6 w-6 text-white/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{program.title}</h3>
                    {!program.is_active && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">Hidden</span>}
                  </div>
                  {program.label && <p className="text-xs text-primary font-medium mt-0.5">{program.label}</p>}
                  <p className="text-sm text-muted-foreground truncate mt-1">{program.description}</p>
                  {program.redirect_url && (
                    <a href={program.redirect_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" />
                      {program.redirect_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(program)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this program?')) deleteMutation.mutate(program.id); }}>
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
            <DialogTitle>{editingId ? 'Edit Program' : 'Add Program'}</DialogTitle>
            <DialogDescription>Configure the program banner with image and redirect link</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="prog_title">Title *</Label>
                <Input id="prog_title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Breakthrough Filmmaking" required />
              </div>
              <div>
                <Label htmlFor="prog_description">Description</Label>
                <Textarea id="prog_description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={2} />
              </div>
              <div>
                <Label htmlFor="prog_label">Label</Label>
                <Input id="prog_label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. FORGE RESIDENCY" />
              </div>
              <FileUpload
                bucket="learn-thumbnails"
                accept="image/*"
                maxSizeMB={10}
                label="Banner Image"
                helperText="Recommended: 1280×465px or similar wide aspect ratio"
                currentUrl={form.image_url}
                onUploadComplete={(url) => setForm(prev => ({ ...prev, image_url: url }))}
              />
              <div>
                <Label htmlFor="prog_redirect">Redirect URL *</Label>
                <Input id="prog_redirect" value={form.redirect_url} onChange={(e) => setForm({ ...form, redirect_url: e.target.value })} placeholder="https://www.example.com" />
              </div>
              <div>
                <Label htmlFor="prog_gradient">Fallback Gradient CSS</Label>
                <Input id="prog_gradient" value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} placeholder="linear-gradient(135deg, ...)" />
                <p className="text-xs text-muted-foreground mt-1">Used when no banner image is uploaded</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prog_tab">Category</Label>
                  <Select value={form.program_tab} onValueChange={(v) => setForm({ ...form, program_tab: v as 'online' | 'offline' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Program</SelectItem>
                      <SelectItem value="offline">Offline Residency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prog_order">Display Order</Label>
                  <Input id="prog_order" type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} min={0} />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Switch id="prog_active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <div>
                  <Label htmlFor="prog_active" className="font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Show this program on the Learn page</p>
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

export default AdminExplorePrograms;
