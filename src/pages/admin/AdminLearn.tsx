import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Sparkles } from 'lucide-react';

interface LearnContentForm {
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  video_url: string;
  duration_minutes: number;
  is_premium: boolean;
  order_index: number;
}

const initialForm: LearnContentForm = {
  title: '',
  description: '',
  category: 'Community Sessions',
  thumbnail_url: '',
  video_url: '',
  duration_minutes: 0,
  is_premium: false,
  order_index: 0,
};

const categories = ['Community Sessions', 'BFP', 'Premium', 'Masterclass'];

const AdminLearn: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LearnContentForm>(initialForm);

  // Fetch learn content
  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-learn-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: LearnContentForm) => {
      if (editingId) {
        const { error } = await supabase
          .from('learn_content')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('learn_content').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-content'] });
      queryClient.invalidateQueries({ queryKey: ['learn_content'] });
      toast.success(editingId ? 'Content updated' : 'Content created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save content: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learn_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-content'] });
      queryClient.invalidateQueries({ queryKey: ['learn_content'] });
      toast.success('Content deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete content: ' + error.message);
    },
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: typeof content[0]) => {
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      thumbnail_url: item.thumbnail_url || '',
      video_url: item.video_url || '',
      duration_minutes: item.duration_minutes || 0,
      is_premium: item.is_premium,
      order_index: item.order_index,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learn Content Management</h1>
          <p className="text-muted-foreground">Create and manage courses and learning content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Content' : 'Create Content'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the content details below' : 'Fill in the content details below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Instructor - Company)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Instructor Name - Company Name"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Order Index</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_premium"
                  checked={form.is_premium}
                  onCheckedChange={(checked) => setForm({ ...form, is_premium: checked })}
                />
                <Label htmlFor="is_premium">Premium Content</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading content...</div>
      ) : content?.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
          <p className="text-muted-foreground mb-4">Create your first course to get started</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-secondary text-foreground text-xs">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.duration_minutes ? `${item.duration_minutes} min` : '-'}
                  </TableCell>
                  <TableCell>
                    {item.is_premium ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        Premium
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Free</span>
                    )}
                  </TableCell>
                  <TableCell>{item.order_index}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this content?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
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

export default AdminLearn;
