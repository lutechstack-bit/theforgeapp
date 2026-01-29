import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, Pencil, Trash2, History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  category: string;
  status: string;
  date_added: string;
  added_by: string | null;
  created_at: string;
}

const CATEGORIES = ['Feature', 'UI', 'Bug Fix', 'Backend', 'Performance', 'Security'];
const STATUSES = ['Completed', 'In Progress', 'Planned', 'On Hold'];

export default function AdminChangelog() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    category: 'Feature',
    status: 'Completed',
    date_added: format(new Date(), 'yyyy-MM-dd'),
    added_by: '',
  });

  const { data: changelog = [], isLoading } = useQuery({
    queryKey: ['admin-changelog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_changelog')
        .select('*')
        .order('date_added', { ascending: false });
      
      if (error) throw error;
      return data as ChangelogEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (entry: Omit<ChangelogEntry, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('app_changelog').insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-changelog'] });
      toast({ title: 'Entry added successfully' });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Failed to add entry', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...entry }: Partial<ChangelogEntry> & { id: string }) => {
      const { error } = await supabase.from('app_changelog').update(entry).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-changelog'] });
      toast({ title: 'Entry updated successfully' });
      setEditingEntry(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Failed to update entry', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('app_changelog').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-changelog'] });
      toast({ title: 'Entry deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete entry', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      version: '',
      title: '',
      description: '',
      category: 'Feature',
      status: 'Completed',
      date_added: format(new Date(), 'yyyy-MM-dd'),
      added_by: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, ...formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setFormData({
      version: entry.version,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      status: entry.status,
      date_added: entry.date_added,
      added_by: entry.added_by || '',
    });
  };

  const exportToCSV = () => {
    const headers = ['Version', 'Title', 'Description', 'Category', 'Status', 'Date', 'Added By'];
    const rows = changelog.map((entry) => [
      entry.version,
      `"${entry.title.replace(/"/g, '""')}"`,
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.category,
      entry.status,
      format(new Date(entry.date_added), 'MMM d, yyyy'),
      entry.added_by || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `forge-changelog-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'CSV exported successfully' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Feature': return 'bg-primary/20 text-primary';
      case 'UI': return 'bg-blue-500/20 text-blue-400';
      case 'Bug Fix': return 'bg-red-500/20 text-red-400';
      case 'Backend': return 'bg-purple-500/20 text-purple-400';
      case 'Performance': return 'bg-green-500/20 text-green-400';
      case 'Security': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'Planned': return 'bg-blue-500/20 text-blue-400';
      case 'On Hold': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="e.g., 1.5.0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_added">Date</Label>
          <Input
            id="date_added"
            type="date"
            value={formData.date_added}
            onChange={(e) => setFormData({ ...formData, date_added: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Short feature name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the change"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="added_by">Added By</Label>
        <Input
          id="added_by"
          value={formData.added_by}
          onChange={(e) => setFormData({ ...formData, added_by: e.target.value })}
          placeholder="Team member name"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddOpen(false);
            setEditingEntry(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
          {editingEntry ? 'Update' : 'Add'} Entry
        </Button>
      </div>
    </form>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Changelog</h1>
            <p className="text-muted-foreground">Track all app updates and changes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={changelog.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Changelog Entry</DialogTitle>
              </DialogHeader>
              <FormContent />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : changelog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No changelog entries yet. Add your first entry!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Version</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Added By</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changelog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono font-medium">{entry.version}</TableCell>
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                      {entry.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(entry.category)}>
                        {entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {format(new Date(entry.date_added), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {entry.added_by || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={editingEntry?.id === entry.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingEntry(null);
                            resetForm();
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Changelog Entry</DialogTitle>
                            </DialogHeader>
                            <FormContent />
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this entry?')) {
                              deleteMutation.mutate(entry.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}