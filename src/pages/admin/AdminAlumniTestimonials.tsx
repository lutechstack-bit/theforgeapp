import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Video } from 'lucide-react';

interface TestimonialForm {
  name: string;
  role: string;
  video_url: string;
  thumbnail_url: string;
  film: string;
  achievement: string;
  is_active: boolean;
  order_index: number;
}

const defaultForm: TestimonialForm = {
  name: '',
  role: '',
  video_url: '',
  thumbnail_url: '',
  film: '',
  achievement: '',
  is_active: true,
  order_index: 0,
};

const AdminAlumniTestimonials: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(defaultForm);

  // Fetch testimonials
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-alumni-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni_testimonials')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TestimonialForm) => {
      const payload = {
        name: data.name,
        role: data.role || null,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url || null,
        film: data.film || null,
        achievement: data.achievement || null,
        is_active: data.is_active,
        order_index: data.order_index,
      };

      if (editingId) {
        const { error } = await supabase
          .from('alumni_testimonials')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alumni_testimonials')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-testimonials'] });
      toast.success(editingId ? 'Testimonial updated' : 'Testimonial created');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alumni_testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-testimonials'] });
      toast.success('Testimonial deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (testimonial: any) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      role: testimonial.role || '',
      video_url: testimonial.video_url,
      thumbnail_url: testimonial.thumbnail_url || '',
      film: testimonial.film || '',
      achievement: testimonial.achievement || '',
      is_active: testimonial.is_active,
      order_index: testimonial.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.video_url.trim()) {
      toast.error('Name and video URL are required');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alumni Testimonials</h1>
          <p className="text-muted-foreground">Manage alumni spotlight videos on the home page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Director & Screenwriter" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL *</Label>
                <Input id="video_url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="/videos/testimonials/name.mp4" required />
                <p className="text-xs text-muted-foreground">Local path like /videos/testimonials/name.mp4</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input id="thumbnail_url" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="Optional thumbnail image" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="film">Film</Label>
                  <Input id="film" value={form.film} onChange={(e) => setForm({ ...form, film: e.target.value })} placeholder="Film name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achievement">Achievement</Label>
                  <Input id="achievement" value={form.achievement} onChange={(e) => setForm({ ...form, achievement: e.target.value })} placeholder="Award or achievement" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_index">Order</Label>
                  <Input id="order_index" type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {testimonials?.map((testimonial) => (
            <Card key={testimonial.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                    {!testimonial.is_active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{testimonial.video_url}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(testimonial)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(testimonial.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {testimonials?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No testimonials yet. Click "Add Testimonial" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAlumniTestimonials;