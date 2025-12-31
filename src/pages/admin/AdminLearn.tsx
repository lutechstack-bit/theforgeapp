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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Sparkles, FileUp, Download, Play, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LearnContentForm {
  title: string;
  description: string;
  full_description: string;
  instructor_name: string;
  company_name: string;
  category: string;
  section_type: string;
  thumbnail_url: string;
  video_url: string;
  duration_minutes: number;
  is_premium: boolean;
  order_index: number;
}

interface ResourceForm {
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
  is_premium: boolean;
  order_index: number;
}

const initialForm: LearnContentForm = {
  title: '',
  description: '',
  full_description: '',
  instructor_name: '',
  company_name: '',
  category: 'Workshop',
  section_type: 'community_sessions',
  thumbnail_url: '',
  video_url: '',
  duration_minutes: 0,
  is_premium: false,
  order_index: 0,
};

const initialResourceForm: ResourceForm = {
  title: '',
  description: '',
  file_url: '',
  file_type: 'pdf',
  file_size_mb: 0,
  is_premium: true,
  order_index: 0,
};

const categories = ['Workshop', 'Masterclass', 'Q&A Session', 'Panel Discussion', 'Tutorial', 'Case Study'];
const sectionTypes = [
  { value: 'community_sessions', label: 'Community Sessions' },
  { value: 'bfp_sessions', label: 'BFP Sessions' },
];
const fileTypes = ['pdf', 'doc', 'xlsx', 'pptx', 'zip', 'other'];

const AdminLearn: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [form, setForm] = useState<LearnContentForm>(initialForm);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(initialResourceForm);
  const [activeTab, setActiveTab] = useState('community_sessions');

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

  // Fetch resources for selected content
  const { data: resources } = useQuery({
    queryKey: ['admin-learn-resources', selectedContentId],
    queryFn: async () => {
      if (!selectedContentId) return [];
      const { data, error } = await supabase
        .from('learn_resources')
        .select('*')
        .eq('learn_content_id', selectedContentId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedContentId,
  });

  // Create/Update content mutation
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

  // Delete content mutation
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

  // Save resource mutation
  const saveResourceMutation = useMutation({
    mutationFn: async (data: ResourceForm & { learn_content_id: string }) => {
      const { error } = await supabase.from('learn_resources').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-resources', selectedContentId] });
      toast.success('Resource added');
      setResourceForm(initialResourceForm);
      setIsResourceDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to add resource: ' + error.message);
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learn_resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-resources', selectedContentId] });
      toast.success('Resource deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete resource: ' + error.message);
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
      full_description: item.full_description || '',
      instructor_name: item.instructor_name || '',
      company_name: item.company_name || '',
      category: item.category,
      section_type: item.section_type || 'community_sessions',
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

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId) return;
    saveResourceMutation.mutate({
      ...resourceForm,
      learn_content_id: selectedContentId,
    });
  };

  const filteredContent = content?.filter(c => c.section_type === activeTab) || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learn Content Management</h1>
          <p className="text-muted-foreground">Manage video content, resources, and bonuses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setForm({ ...initialForm, section_type: activeTab }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Content' : 'Create Content'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the content details below' : 'Fill in the content details below'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Session title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="section_type">Section *</Label>
                    <Select
                      value={form.section_type}
                      onValueChange={(value) => setForm({ ...form, section_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instructor_name">Instructor Name</Label>
                    <Input
                      id="instructor_name"
                      value={form.instructor_name}
                      onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name">Company</Label>
                    <Input
                      id="company_name"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Google"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description for the card"
                  />
                </div>

                <div>
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea
                    id="full_description"
                    value={form.full_description}
                    onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                    placeholder="Detailed description shown in the video player"
                    rows={3}
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
                  <Label htmlFor="video_url">Video URL *</Label>
                  <Input
                    id="video_url"
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="https://... (direct video file URL)"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use a direct video URL. For DRM protection, videos are served through our secure player.
                  </p>
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
                    <Label htmlFor="order_index">Display Order</Label>
                    <Input
                      id="order_index"
                      type="number"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Switch
                    id="is_premium"
                    checked={form.is_premium}
                    onCheckedChange={(checked) => setForm({ ...form, is_premium: checked })}
                  />
                  <div>
                    <Label htmlFor="is_premium" className="font-medium">Premium Content</Label>
                    <p className="text-xs text-muted-foreground">Only accessible to fully paid members</p>
                  </div>
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
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="community_sessions" className="rounded-md px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Community Sessions
          </TabsTrigger>
          <TabsTrigger value="bfp_sessions" className="rounded-md px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            BFP Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading content...</div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">Create your first content in this section</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-16 h-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-16 h-10 rounded-md bg-secondary flex items-center justify-center">
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.instructor_name || '-'}</p>
                          {item.company_name && (
                            <p className="text-xs text-muted-foreground">{item.company_name}</p>
                          )}
                        </div>
                      </TableCell>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContentId(item.id);
                            setIsResourceDialogOpen(true);
                          }}
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </TableCell>
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
        </TabsContent>
      </Tabs>

      {/* Resource Management Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Bonus Resources</DialogTitle>
            <DialogDescription>
              Add downloadable resources like PDFs, templates, and checklists
            </DialogDescription>
          </DialogHeader>

          {/* Existing Resources */}
          {resources && resources.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-foreground">Current Resources</h4>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.file_type.toUpperCase()}
                          {resource.file_size_mb && ` • ${resource.file_size_mb} MB`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this resource?')) {
                          deleteResourceMutation.mutate(resource.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Resource Form */}
          <form onSubmit={handleResourceSubmit} className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Add New Resource</h4>
            
            <div>
              <Label htmlFor="resource_title">Resource Title</Label>
              <Input
                id="resource_title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g., Workshop Slides"
                required
              />
            </div>

            <div>
              <Label htmlFor="resource_description">Description</Label>
              <Input
                id="resource_description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Brief description of the resource"
              />
            </div>

            <div>
              <Label htmlFor="resource_file_url">File URL</Label>
              <Input
                id="resource_file_url"
                value={resourceForm.file_url}
                onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                placeholder="Path in learn-resources bucket"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload file to the learn-resources storage bucket first
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource_file_type">File Type</Label>
                <Select
                  value={resourceForm.file_type}
                  onValueChange={(value) => setResourceForm({ ...resourceForm, file_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resource_file_size">Size (MB)</Label>
                <Input
                  id="resource_file_size"
                  type="number"
                  step="0.1"
                  value={resourceForm.file_size_mb}
                  onChange={(e) => setResourceForm({ ...resourceForm, file_size_mb: parseFloat(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={saveResourceMutation.isPending}>
                {saveResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLearn;
