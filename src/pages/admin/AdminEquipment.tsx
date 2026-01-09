import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react';

interface Equipment {
  id: string;
  cohort_type: string;
  category: string;
  brand: string;
  name: string;
  model: string | null;
  description: string | null;
  specs: string[];
  image_url: string | null;
  is_featured: boolean;
  order_index: number;
  is_active: boolean;
}

const cohortTypes = [
  { value: 'FORGE', label: 'Forge Filmmakers' },
  { value: 'FORGE_CREATORS', label: 'Forge Creators' },
  { value: 'FORGE_WRITING', label: 'Forge Writing' },
];

const categories = [
  'camera', 'lens', 'audio', 'lighting', 'grip', 'software'
];

const AdminEquipment: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState('FORGE');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'camera',
    brand: '',
    name: '',
    model: '',
    description: '',
    specs: '',
    image_url: '',
    is_featured: false,
    order_index: 0,
    is_active: true,
  });

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['admin-equipment', selectedCohort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forge_equipment')
        .select('*')
        .eq('cohort_type', selectedCohort)
        .order('order_index');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        specs: Array.isArray(item.specs) ? item.specs as string[] : []
      })) as Equipment[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const specs = data.specs.split(',').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('forge_equipment').insert({
        cohort_type: selectedCohort,
        category: data.category,
        brand: data.brand,
        name: data.name,
        model: data.model || null,
        description: data.description || null,
        specs,
        image_url: data.image_url || null,
        is_featured: data.is_featured,
        order_index: data.order_index,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment added');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(`Failed to add: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const specs = data.specs.split(',').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('forge_equipment').update({
        category: data.category,
        brand: data.brand,
        name: data.name,
        model: data.model || null,
        description: data.description || null,
        specs,
        image_url: data.image_url || null,
        is_featured: data.is_featured,
        order_index: data.order_index,
        is_active: data.is_active,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment updated');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(`Failed to update: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('forge_equipment').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment deleted');
      setDeleteDialogOpen(false);
    },
    onError: (error) => toast.error(`Failed to delete: ${error.message}`),
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      category: 'camera',
      brand: '',
      name: '',
      model: '',
      description: '',
      specs: '',
      image_url: '',
      is_featured: false,
      order_index: 0,
      is_active: true,
    });
  };

  const openEditDialog = (item: Equipment) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      brand: item.brand,
      name: item.name,
      model: item.model || '',
      description: item.description || '',
      specs: item.specs.join(', '),
      image_url: item.image_url || '',
      is_featured: item.is_featured,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Equipment Management</h1>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Equipment
        </Button>
      </div>

      {/* Cohort Filter */}
      <div className="mb-6">
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cohortTypes.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Equipment List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {equipment?.map((item) => (
            <div key={item.id} className="glass-card p-4 rounded-xl flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-muted/50" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.category}</span>
                  {item.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Featured</span>}
                  {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Inactive</span>}
                </div>
                <p className="font-medium">{item.brand} {item.name}</p>
                <p className="text-sm text-muted-foreground">{item.model}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setDeletingId(item.id); setDeleteDialogOpen(true); }}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add Equipment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order Index</Label>
                <Input type="number" value={formData.order_index} onChange={(e) => setFormData(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))} placeholder="Sony" />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Cinema Line" />
            </div>
            <div>
              <Label>Model</Label>
              <Input value={formData.model} onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))} placeholder="FX3" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Use case description..." />
            </div>
            <div>
              <Label>Specs (comma-separated)</Label>
              <Input value={formData.specs} onChange={(e) => setFormData(p => ({ ...p, specs: e.target.value }))} placeholder="4K 120fps, S-Log3, Full-Frame" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))} placeholder="/images/equipment/sony-fx3.png" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData(p => ({ ...p, is_featured: c }))} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(p => ({ ...p, is_active: c }))} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteMutation.mutate(deletingId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEquipment;
