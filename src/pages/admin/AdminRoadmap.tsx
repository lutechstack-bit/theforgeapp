import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Loader2, Clock, MapPin, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

export default function AdminRoadmap() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<RoadmapDay | null>(null);
  const [deletingDay, setDeletingDay] = useState<RoadmapDay | null>(null);
  const queryClient = useQueryClient();

  // Fetch shared template roadmap days (edition_id IS NULL)
  const { data: roadmapDays, isLoading: daysLoading } = useQuery({
    queryKey: ['admin-roadmap-days-template'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .is('edition_id', null)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return data as RoadmapDay[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<RoadmapDay, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('roadmap_days').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RoadmapDay> & { id: string }) => {
      const { error } = await supabase.from('roadmap_days').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days'] });
      setEditingDay(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roadmap_days').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days-template'] });
      setDeletingDay(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roadmap Template</h1>
          <p className="text-muted-foreground mt-1">Shared roadmap content for all editions. Dates are calculated from each edition's start date.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Day
        </Button>
      </div>

      {/* Roadmap Days List */}
      {daysLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : roadmapDays?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            No days added yet. Create your first day to build the roadmap.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {roadmapDays?.map((day) => (
            <Card key={day.id} className="bg-card/50 border-border/50">
              <CardContent className="py-4 px-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="font-bold text-primary w-12">
                      {day.day_number === 0 ? 'Pre' : `Day ${day.day_number}`}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{day.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {day.call_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {day.call_time}
                        </span>
                      )}
                      {day.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {day.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${day.is_active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {day.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setEditingDay(day)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingDay(day)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <RoadmapDayDialog
        open={isDialogOpen || !!editingDay}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingDay(null);
          }
        }}
        day={editingDay}
        onSubmit={(data) => {
          if (editingDay) {
            updateMutation.mutate({ id: editingDay.id, ...data });
          } else {
            createMutation.mutate(data as any);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDay} onOpenChange={() => setDeletingDay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingDay?.title}" from the roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDay && deleteMutation.mutate(deletingDay.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoadmapDayDialog({
  open,
  onOpenChange,
  day,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: RoadmapDay | null;
  onSubmit: (data: Partial<RoadmapDay>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    day_number: 0,
    title: '',
    description: '',
    call_time: '',
    location: '',
    is_active: false,
    checklist: [] as string[]
  });
  const [checklistInput, setChecklistInput] = useState('');

  React.useEffect(() => {
    if (day) {
      setFormData({
        day_number: day.day_number,
        title: day.title,
        description: day.description || '',
        call_time: day.call_time || '',
        location: day.location || '',
        is_active: day.is_active,
        checklist: (day.checklist as string[]) || []
      });
    } else {
      setFormData({
        day_number: 0,
        title: '',
        description: '',
        call_time: '',
        location: '',
        is_active: false,
        checklist: []
      });
    }
  }, [day, open]);

  const addChecklistItem = () => {
    if (checklistInput.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, checklistInput.trim()]
      }));
      setChecklistInput('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      edition_id: null, // Template days have no edition
      day_number: formData.day_number,
      title: formData.title,
      description: formData.description || null,
      date: null, // Dates are calculated dynamically
      call_time: formData.call_time || null,
      location: formData.location || null,
      is_active: formData.is_active,
      checklist: formData.checklist.length > 0 ? formData.checklist : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{day ? 'Edit Day' : 'Add Day'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day Number *</Label>
              <Input
                type="number"
                required
                min={0}
                value={formData.day_number}
                onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">0 = Pre-Forge</p>
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-6">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              placeholder="e.g., Orientation & Foundations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What happens on this day..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Call Time</Label>
            <Input
              type="time"
              value={formData.call_time}
              onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Dates are calculated automatically from edition start date</p>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="e.g., Mumbai Hub"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Checklist Items</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add checklist item"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
              />
              <Button type="button" variant="secondary" onClick={addChecklistItem}>
                Add
              </Button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded">
                    <span className="flex-1">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {day ? 'Save Changes' : 'Add Day'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
