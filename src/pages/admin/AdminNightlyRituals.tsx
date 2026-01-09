import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Moon, 
  BookOpen, 
  Sunrise, 
  Heart,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface NightlyRitualItem {
  id: string;
  cohort_type: string;
  day_number: number;
  category: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_required: boolean;
}

const COHORT_OPTIONS = [
  { value: 'FORGE', label: 'Forge Filmmakers' },
  { value: 'FORGE_CREATORS', label: 'Forge Creators' },
  { value: 'FORGE_WRITING', label: 'Forge Writing' },
];

const CATEGORY_OPTIONS = [
  { value: 'reflect', label: 'Reflect', icon: BookOpen },
  { value: 'prepare', label: 'Prepare', icon: Sunrise },
  { value: 'wellness', label: 'Wellness', icon: Heart },
];

const ICON_OPTIONS = [
  'Moon', 'BookOpen', 'Users', 'Calendar', 'Lightbulb', 'Shirt', 'Droplet', 'Clock',
  'Battery', 'Film', 'Sparkles', 'Camera', 'FileText', 'Phone', 'Package', 'Backpack',
  'CheckCircle', 'AlertCircle', 'Heart', 'Trophy', 'HardDrive', 'FolderOpen', 'Headphones',
  'Volume2', 'Loader', 'HelpCircle', 'Music', 'Eye', 'Star', 'Mic', 'Briefcase', 'Sunrise',
  'Video', 'TrendingUp', 'MapPin', 'Building', 'Footprints', 'DollarSign', 'Map', 'Palmtree',
  'BarChart', 'Download', 'Plane', 'Sun', 'Cloud', 'Zap', 'Edit', 'Award'
];

const AdminNightlyRituals: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState<string>('FORGE');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NightlyRitualItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    cohort_type: 'FORGE',
    day_number: 1,
    category: 'reflect',
    title: '',
    description: '',
    icon: 'Moon',
    order_index: 0,
    is_required: false,
  });

  // Fetch all ritual items
  const { data: ritualItems = [], isLoading } = useQuery({
    queryKey: ['admin-nightly-rituals', selectedCohort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nightly_ritual_items')
        .select('*')
        .eq('cohort_type', selectedCohort)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as NightlyRitualItem[];
    },
  });

  // Get unique days
  const uniqueDays = [...new Set(ritualItems.map(item => item.day_number))].sort((a, b) => a - b);

  // Filter by selected day
  const filteredItems = selectedDay 
    ? ritualItems.filter(item => item.day_number === selectedDay)
    : ritualItems;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('nightly_ritual_items')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-nightly-rituals'] });
      toast.success('Ritual item created');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create item: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('nightly_ritual_items')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-nightly-rituals'] });
      toast.success('Ritual item updated');
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nightly_ritual_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-nightly-rituals'] });
      toast.success('Ritual item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      cohort_type: selectedCohort,
      day_number: 1,
      category: 'reflect',
      title: '',
      description: '',
      icon: 'Moon',
      order_index: 0,
      is_required: false,
    });
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    resetForm();
    setFormData(prev => ({ ...prev, cohort_type: selectedCohort }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: NightlyRitualItem) => {
    setEditingItem(item);
    setFormData({
      cohort_type: item.cohort_type,
      day_number: item.day_number,
      category: item.category,
      title: item.title,
      description: item.description || '',
      icon: item.icon || 'Moon',
      order_index: item.order_index,
      is_required: item.is_required,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORY_OPTIONS.find(c => c.value === category);
    if (!cat) return null;
    const Icon = cat.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Nightly Rituals</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Label className="mb-2 block text-sm">Cohort</Label>
          <Select value={selectedCohort} onValueChange={setSelectedCohort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COHORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label className="mb-2 block text-sm">Day</Label>
          <Select 
            value={selectedDay?.toString() || 'all'} 
            onValueChange={(v) => setSelectedDay(v === 'all' ? null : parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {uniqueDays.map(day => (
                <SelectItem key={day} value={day.toString()}>
                  Day {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{ritualItems.length}</p>
          <p className="text-sm text-muted-foreground">Total Items</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold">{uniqueDays.length}</p>
          <p className="text-sm text-muted-foreground">Days Covered</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-2xl font-bold">{ritualItems.filter(i => i.category === 'reflect').length}</p>
          <p className="text-sm text-amber-400">Reflect</p>
        </div>
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-2xl font-bold">{ritualItems.filter(i => i.category === 'wellness').length}</p>
          <p className="text-sm text-emerald-400">Wellness</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Day</TableHead>
                <TableHead className="w-24">Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-16">Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">Day {item.day_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.order_index}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this item?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No items found. Add your first ritual item!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Ritual Item' : 'Add Ritual Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cohort</Label>
                <Select 
                  value={formData.cohort_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, cohort_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COHORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Day Number</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.day_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, day_number: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Write 3 key takeaways"
              />
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context or instructions"
                rows={2}
              />
            </div>

            <div>
              <Label>Icon</Label>
              <Select 
                value={formData.icon} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, icon: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_required}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_required: v }))}
              />
              <Label>Required item</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNightlyRituals;
