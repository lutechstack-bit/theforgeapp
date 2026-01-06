import React, { useRef, useState } from 'react';
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
import { Plus, Pencil, Trash2, BookOpen, Sparkles, FileUp, Download, Play, Users, AlertTriangle, Link, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/admin/FileUpload';

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
  video_source_type: 'upload' | 'embed';
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
  video_source_type: 'upload',
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
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const videoUrlRef = useRef<string>('');
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
    videoUrlRef.current = '';
    setIsVideoUploading(false);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: typeof content[0]) => {
    const nextVideoUrl = item.video_url || '';
    const sourceType = (item.video_source_type as 'upload' | 'embed') || 'upload';

    setForm({
      title: item.title,
      description: item.description || '',
      full_description: item.full_description || '',
      instructor_name: item.instructor_name || '',
      company_name: item.company_name || '',
      category: item.category,
      section_type: item.section_type || 'community_sessions',
      thumbnail_url: item.thumbnail_url || '',
      video_url: nextVideoUrl,
      video_source_type: sourceType,
      duration_minutes: item.duration_minutes || 0,
      is_premium: item.is_premium,
      order_index: item.order_index,
    });

    videoUrlRef.current = nextVideoUrl;
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.video_source_type === 'upload') {
      if (isVideoUploading) {
        toast.error('Please wait for the video upload to finish');
        return;
      }

      const finalVideoUrl = videoUrlRef.current || form.video_url;
      if (!finalVideoUrl) {
        toast.error('Please upload a video before saving');
        return;
      }

      saveMutation.mutate({ ...form, video_url: finalVideoUrl });
    } else {
      // Embed mode - validate Vimeo URL
      const vimeoRegex = /^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)\/(video\/)?(\d+)(\/[a-zA-Z0-9]+)?/;
      if (!form.video_url || !vimeoRegex.test(form.video_url)) {
        toast.error('Please enter a valid Vimeo URL');
        return;
      }

      saveMutation.mutate(form);
    }
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
          <p className="text-muted-foreground">Upload videos, manage content, and add bonus resources</p>
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
                {editingId ? 'Update the content details below' : 'Upload video and fill in content details'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Source Section */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    Video Source
                  </h3>
                  
                  {/* Video Source Toggle */}
                  <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
                    <Button
                      type="button"
                      size="sm"
                      variant={form.video_source_type === 'upload' ? 'default' : 'ghost'}
                      className="gap-2"
                      onClick={() => setForm({ ...form, video_source_type: 'upload', video_url: '' })}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Video
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={form.video_source_type === 'embed' ? 'default' : 'ghost'}
                      className="gap-2"
                      onClick={() => setForm({ ...form, video_source_type: 'embed', video_url: '' })}
                    >
                      <Link className="h-4 w-4" />
                      Embed Link
                    </Button>
                  </div>

                  {/* Upload Mode */}
                  {form.video_source_type === 'upload' && (
                    <FileUpload
                      bucket="learn-videos"
                      accept="video/*"
                      maxSizeMB={5120}
                      label="Video File"
                      helperText="Supported formats: MP4, WebM, MOV. Max 5GB. Duration auto-detected."
                      currentUrl={form.video_url}
                      onUploadingChange={setIsVideoUploading}
                      onUploadComplete={(url) => {
                        videoUrlRef.current = url;
                        setForm((prev) => ({ ...prev, video_url: url }));
                      }}
                      onDurationDetected={(duration) => {
                        setForm((prev) => ({ ...prev, duration_minutes: duration }));
                      }}
                    />
                  )}

                  {/* Embed Mode */}
                  {form.video_source_type === 'embed' && (
                    <div className="space-y-2">
                      <Label htmlFor="vimeo_url">Vimeo URL</Label>
                      <Input
                        id="vimeo_url"
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                        placeholder="Paste Vimeo URL or full embed code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste your Vimeo URL or the full embed code from Vimeo's share button.
                      </p>
                    </div>
                  )}

                  <FileUpload
                    bucket="learn-thumbnails"
                    accept="image/*"
                    maxSizeMB={10}
                    label="Thumbnail Image"
                    helperText="Recommended: 16:9 aspect ratio, min 1280x720px"
                    currentUrl={form.thumbnail_url}
                    onUploadComplete={(url) => setForm((prev) => ({ ...prev, thumbnail_url: url }))}
                  />
                </div>

                {/* Basic Info */}
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

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
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

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending || (form.video_source_type === 'upload' && isVideoUploading) || !form.video_url}
                  >
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
              <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
              <Button onClick={() => { resetForm(); setForm({ ...initialForm, section_type: activeTab }); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
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
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{item.title}</p>
                              {!item.video_url && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-medium">
                                  <AlertTriangle className="h-3 w-3" />
                                  No video
                                </span>
                              )}
                            </div>
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
              Upload downloadable resources like PDFs, templates, and checklists
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
            
            <FileUpload
              bucket="learn-resources"
              accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip"
              maxSizeMB={50}
              label="Upload Resource File"
              helperText="PDF, Word, Excel, PowerPoint, or ZIP files. Max 50MB."
              onUploadComplete={(url, path) => {
                setResourceForm({ 
                  ...resourceForm, 
                  file_url: path,
                  // Auto-detect file type
                  file_type: path.split('.').pop() || 'other'
                });
              }}
            />

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
              <Label htmlFor="resource_description">Description (optional)</Label>
              <Input
                id="resource_description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Brief description of the resource"
              />
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
              <Button type="submit" disabled={saveResourceMutation.isPending || !resourceForm.file_url}>
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
