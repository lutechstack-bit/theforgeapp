import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PastProgramForm {
  name: string;
  program_type: string;
  completion_date: string;
  image_url: string;
  description: string;
  recording_url: string;
  is_active: boolean;
}

const initialForm: PastProgramForm = {
  name: '',
  program_type: 'FORGE',
  completion_date: '',
  image_url: '',
  description: '',
  recording_url: '',
  is_active: true,
};

const AdminPastPrograms: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PastProgramForm>(initialForm);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['admin-past-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('past_programs')
        .select('*')
        .order('completion_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PastProgramForm) => {
      if (editingId) {
        const { error } = await supabase
          .from('past_programs')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('past_programs').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-past-programs'] });
      toast.success(editingId ? 'Program updated' : 'Program created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save program');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('past_programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-past-programs'] });
      toast.success('Program deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete program');
      console.error(error);
    },
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (program: typeof programs[0]) => {
    setForm({
      name: program.name,
      program_type: program.program_type,
      completion_date: program.completion_date,
      image_url: program.image_url || '',
      description: program.description || '',
      recording_url: program.recording_url || '',
      is_active: program.is_active,
    });
    setEditingId(program.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Past Programs</h1>
          <p className="text-muted-foreground">Manage completed Forge/Live/Write programs</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Program' : 'Add Program'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., FORGE Creators Batch 3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Program Type</Label>
                  <Select
                    value={form.program_type}
                    onValueChange={(value) => setForm({ ...form, program_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FORGE">FORGE</SelectItem>
                      <SelectItem value="LIVE">LIVE</SelectItem>
                      <SelectItem value="WRITE">WRITE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Completion Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.completion_date}
                    onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image URL</Label>
                <Input
                  id="image"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the program..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recording">Recording URL (optional)</Label>
                <Input
                  id="recording"
                  value={form.recording_url}
                  onChange={(e) => setForm({ ...form, recording_url: e.target.value })}
                  placeholder="YouTube or Vimeo URL"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
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
      ) : programs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No past programs yet
        </div>
      ) : (
        <div className="bg-card/60 border border-border/50 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Recording</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      program.program_type === 'FORGE' 
                        ? 'bg-primary/20 text-primary'
                        : program.program_type === 'WRITE'
                        ? 'bg-accent/20 text-accent-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {program.program_type}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(program.completion_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {program.recording_url ? (
                      <span className="text-xs text-green-500">Available</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      program.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {program.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(program)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(program.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPastPrograms;
