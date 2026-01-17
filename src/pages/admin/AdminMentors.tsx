import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { FileUpload } from '@/components/admin/FileUpload';

interface MentorBrand {
  name: string;
  logoUrl?: string;
}

interface MentorForm {
  name: string;
  title: string;
  roles: string[];
  image_url: string;
  modal_image_url: string;
  bio: string[];
  brands: MentorBrand[];
  is_active: boolean;
  order_index: number;
  cohort_types: string[];
}

const COHORT_OPTIONS = [
  { value: 'FORGE', label: 'Filmmaking' },
  { value: 'FORGE_WRITING', label: 'Writing' },
  { value: 'FORGE_CREATORS', label: 'Creators' },
];

const defaultForm: MentorForm = {
  name: '',
  title: '',
  roles: [''],
  image_url: '',
  modal_image_url: '',
  bio: [''],
  brands: [{ name: '', logoUrl: '' }],
  is_active: true,
  order_index: 0,
  cohort_types: ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
};

const AdminMentors: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MentorForm>(defaultForm);

  // Fetch mentors - use raw query to get all including inactive
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['admin-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: MentorForm) => {
      const payload = {
        name: data.name,
        title: data.title,
        roles: data.roles.filter(r => r.trim()),
        image_url: data.image_url || null,
        modal_image_url: data.modal_image_url || null,
        bio: data.bio.filter(b => b.trim()),
        brands: data.brands.filter(b => b.name.trim()) as unknown as Json,
        is_active: data.is_active,
        order_index: data.order_index,
        cohort_types: data.cohort_types,
      };

      if (editingId) {
        const { error } = await supabase
          .from('mentors')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mentors')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast.success(editingId ? 'Mentor updated' : 'Mentor created');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mentors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mentors'] });
      toast.success('Mentor deleted');
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

  const handleEdit = (mentor: any) => {
    setEditingId(mentor.id);
    setForm({
      name: mentor.name,
      title: mentor.title,
      roles: mentor.roles?.length ? mentor.roles : [''],
      image_url: mentor.image_url || '',
      modal_image_url: mentor.modal_image_url || '',
      bio: mentor.bio?.length ? mentor.bio : [''],
      brands: mentor.brands?.length ? mentor.brands : [{ name: '', logoUrl: '' }],
      is_active: mentor.is_active,
      order_index: mentor.order_index,
      cohort_types: mentor.cohort_types?.length ? mentor.cohort_types : ['FORGE', 'FORGE_WRITING', 'FORGE_CREATORS'],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.title.trim()) {
      toast.error('Name and title are required');
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

  // Array field helpers
  const addRole = () => setForm({ ...form, roles: [...form.roles, ''] });
  const removeRole = (idx: number) => setForm({ ...form, roles: form.roles.filter((_, i) => i !== idx) });
  const updateRole = (idx: number, value: string) => {
    const newRoles = [...form.roles];
    newRoles[idx] = value;
    setForm({ ...form, roles: newRoles });
  };

  const addBio = () => setForm({ ...form, bio: [...form.bio, ''] });
  const removeBio = (idx: number) => setForm({ ...form, bio: form.bio.filter((_, i) => i !== idx) });
  const updateBio = (idx: number, value: string) => {
    const newBio = [...form.bio];
    newBio[idx] = value;
    setForm({ ...form, bio: newBio });
  };

  const addBrand = () => setForm({ ...form, brands: [...form.brands, { name: '', logoUrl: '' }] });
  const removeBrand = (idx: number) => setForm({ ...form, brands: form.brands.filter((_, i) => i !== idx) });
  const updateBrand = (idx: number, field: keyof MentorBrand, value: string) => {
    const newBrands = [...form.brands];
    newBrands[idx] = { ...newBrands[idx], [field]: value };
    setForm({ ...form, brands: newBrands });
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
          <h1 className="text-2xl font-bold text-foreground">Mentors</h1>
          <p className="text-muted-foreground">Manage mentor profiles displayed on the home page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Mentor' : 'Add Mentor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
              </div>

              {/* Cohort Selection */}
              <div className="space-y-2">
                <Label>Show in Cohorts *</Label>
                <p className="text-xs text-muted-foreground">Select which cohort types should see this mentor</p>
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

              {/* Image Uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Image</Label>
                  <FileUpload
                    bucket="user-uploads"
                    onUploadComplete={(url) => setForm({ ...form, image_url: url })}
                    accept="image/*"
                    maxSizeMB={10}
                    label="Upload card image"
                  />
                  {form.image_url && (
                    <div className="mt-2 relative">
                      <img src={form.image_url} alt="Card preview" className="w-full h-32 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setForm({ ...form, image_url: '' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Modal Image</Label>
                  <FileUpload
                    bucket="user-uploads"
                    onUploadComplete={(url) => setForm({ ...form, modal_image_url: url })}
                    accept="image/*"
                    maxSizeMB={10}
                    label="Upload modal image"
                  />
                  {form.modal_image_url && (
                    <div className="mt-2 relative">
                      <img src={form.modal_image_url} alt="Modal preview" className="w-full h-32 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setForm({ ...form, modal_image_url: '' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                {form.roles.map((role, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={role} onChange={(e) => updateRole(idx, e.target.value)} placeholder="e.g. Director" />
                    {form.roles.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRole(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRole}>+ Add Role</Button>
              </div>

              <div className="space-y-2">
                <Label>Bio Paragraphs</Label>
                {form.bio.map((para, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Textarea value={para} onChange={(e) => updateBio(idx, e.target.value)} placeholder="Bio paragraph..." rows={2} />
                    {form.bio.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBio(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addBio}>+ Add Paragraph</Button>
              </div>

              <div className="space-y-2">
                <Label>Brands</Label>
                {form.brands.map((brand, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={brand.name} onChange={(e) => updateBrand(idx, 'name', e.target.value)} placeholder="Brand name" className="flex-1" />
                    <Input value={brand.logoUrl || ''} onChange={(e) => updateBrand(idx, 'logoUrl', e.target.value)} placeholder="Logo URL (optional)" className="flex-1" />
                    {form.brands.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBrand(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addBrand}>+ Add Brand</Button>
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
          {mentors?.map((mentor) => (
            <Card key={mentor.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                {mentor.image_url && (
                  <img src={mentor.image_url} alt={mentor.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{mentor.name}</h3>
                    {!mentor.is_active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(mentor.roles as string[])?.slice(0, 3).map((role, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{role}</span>
                    ))}
                  </div>
                  {/* Cohort badges */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {getCohortLabels(mentor.cohort_types as string[]).map((label, idx) => (
                      <span key={idx} className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded">{label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(mentor)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(mentor.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {mentors?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No mentors yet. Click "Add Mentor" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMentors;