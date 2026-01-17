import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Video, X } from 'lucide-react';
import { FileUpload } from '@/components/admin/FileUpload';

interface TestimonialForm {
  name: string;
  role: string;
  video_url: string;
  thumbnail_url: string;
  film: string;
  achievement: string;
  is_active: boolean;
  order_index: number;
  cohort_types: string[];
}

const COHORT_OPTIONS = [
  { value: 'FORGE', label: 'Filmmaking' },
  { value: 'FORGE_WRITING', label: 'Writing' },
  { value: 'FORGE_CREATORS', label: 'Creators' },
];

const defaultForm: TestimonialForm = {
  name: '',
  role: '',
  video_url: '',
  thumbnail_url: '',
  film: '',
  achievement: '',
  is_active: true,
  order_index: 0,
  cohort_types: ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
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
        cohort_types: data.cohort_types,
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
      cohort_types: testimonial.cohort_types?.length ? testimonial.cohort_types : ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.video_url.trim()) {
      toast.error('Name and video are required');
      return;
    }
    if (form.cohort_types.length === 0) {
      toast.error('Please select at least one cohort');
      return;
    }
    saveMutation.mutate(form);
  };

  // Cohort toggle helper
  const toggleCohort = (cohort: string) => {
    setForm(prev => ({
      ...prev,
      cohort_types: prev.cohort_types.includes(cohort)
        ? prev.cohort_types.filter(c => c !== cohort)
        : [...prev.cohort_types, cohort]
    }));
  };

  // Get cohort labels for display
  const getCohortLabels = (cohortTypes: string[] | null) => {
    if (!cohortTypes || cohortTypes.length === 0) return [];
    return cohortTypes.map(ct => COHORT_OPTIONS.find(o => o.value === ct)?.label || ct);
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

              {/* Cohort Selection */}
              <div className="space-y-2">
                <Label>Show in Cohorts *</Label>
                <p className="text-xs text-muted-foreground">Select which cohort types should see this testimonial</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  {COHORT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cohort-${option.value}`}
                        checked={form.cohort_types.includes(option.value)}
                        onCheckedChange={() => toggleCohort(option.value)}
                      />
                      <Label htmlFor={`cohort-${option.value}`} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <Label>Video *</Label>
                <FileUpload
                  bucket="user-uploads"
                  onUploadComplete={(url) => setForm({ ...form, video_url: url })}
                  accept="video/*"
                  maxSizeMB={500}
                  label="Upload video (up to 500MB)"
                />
                {form.video_url && (
                  <div className="mt-2 relative">
                    <video src={form.video_url} className="w-full h-32 object-cover rounded-lg" controls />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setForm({ ...form, video_url: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <FileUpload
                  bucket="user-uploads"
                  onUploadComplete={(url) => setForm({ ...form, thumbnail_url: url })}
                  accept="image/*"
                  maxSizeMB={10}
                  label="Upload thumbnail image"
                />
                {form.thumbnail_url && (
                  <div className="mt-2 relative">
                    <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setForm({ ...form, thumbnail_url: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
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
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {testimonial.thumbnail_url ? (
                    <img src={testimonial.thumbnail_url} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-6 h-6 text-muted-foreground" />
                  )}
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
                  {/* Cohort badges */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {getCohortLabels(testimonial.cohort_types as string[]).map((label, idx) => (
                      <span key={idx} className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded">{label}</span>
                    ))}
                  </div>
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