import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Highlight {
  id: string;
  highlight_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  highlight_date: string;
  is_pinned: boolean;
  order_index: number;
}

const AdminCommunityHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);

  const [formData, setFormData] = useState({
    highlight_type: 'milestone',
    title: '',
    description: '',
    image_url: '',
    highlight_date: new Date().toISOString().split('T')[0],
    is_pinned: false,
    order_index: 0,
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('community_highlights')
        .select('*')
        .order('order_index', { ascending: true })
        .order('highlight_date', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast.error('Failed to load highlights');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        description: formData.description || null,
        image_url: formData.image_url || null,
      };

      if (editingHighlight) {
        const { error } = await supabase
          .from('community_highlights')
          .update(payload)
          .eq('id', editingHighlight.id);

        if (error) throw error;
        toast.success('Highlight updated');
      } else {
        const { error } = await supabase
          .from('community_highlights')
          .insert(payload);

        if (error) throw error;
        toast.success('Highlight created');
      }

      setDialogOpen(false);
      resetForm();
      fetchHighlights();
    } catch (error) {
      console.error('Error saving highlight:', error);
      toast.error('Failed to save highlight');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setFormData({
      highlight_type: highlight.highlight_type,
      title: highlight.title,
      description: highlight.description || '',
      image_url: highlight.image_url || '',
      highlight_date: highlight.highlight_date.split('T')[0],
      is_pinned: highlight.is_pinned,
      order_index: highlight.order_index,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) return;

    try {
      const { error } = await supabase
        .from('community_highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Highlight deleted');
      fetchHighlights();
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight');
    }
  };

  const resetForm = () => {
    setEditingHighlight(null);
    setFormData({
      highlight_type: 'milestone',
      title: '',
      description: '',
      image_url: '',
      highlight_date: new Date().toISOString().split('T')[0],
      is_pinned: false,
      order_index: 0,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'milestone':
        return '🏆 Milestone';
      case 'achievement':
        return '⭐ Achievement';
      case 'moment':
        return '✨ Moment';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Community Highlights</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Highlight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHighlight ? 'Edit Highlight' : 'Add Highlight'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.highlight_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, highlight_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">🏆 Milestone</SelectItem>
                    <SelectItem value="achievement">⭐ Achievement</SelectItem>
                    <SelectItem value="moment">✨ Moment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., 100 Films Created!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional details..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.highlight_date}
                  onChange={(e) =>
                    setFormData({ ...formData, highlight_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_pinned: checked })
                  }
                />
                <Label>Pin to top</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingHighlight ? 'Update' : 'Create'} Highlight
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Pinned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {highlights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No highlights yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              highlights.map((highlight) => (
                <TableRow key={highlight.id}>
                  <TableCell>{getTypeLabel(highlight.highlight_type)}</TableCell>
                  <TableCell className="font-medium">{highlight.title}</TableCell>
                  <TableCell>
                    {format(new Date(highlight.highlight_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {highlight.is_pinned ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        Pinned
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(highlight)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(highlight.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCommunityHighlights;
