import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit2, Trash2, Loader2, Camera, Film, MapPin,
  Image as ImageIcon, Youtube, Instagram, Save, X, Upload, Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/admin/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarContentItem {
  id: string;
  edition_id: string | null;
  block_type: string;
  title: string | null;
  media_url: string;
  media_type: string;
  caption: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

interface ContentEdition {
  content_id: string;
  edition_id: string;
}

interface ContentForm {
  edition_ids: string[];
  block_type: string;
  title: string;
  media_url: string;
  media_type: string;
  caption: string;
  order_index: number;
  is_active: boolean;
}

const initialForm: ContentForm = {
  edition_ids: [],
  block_type: 'past_moments',
  title: '',
  media_url: '',
  media_type: 'image',
  caption: '',
  order_index: 0,
  is_active: true
};

const blockTypeConfig = {
  past_moments: { label: 'Past Moments', icon: Camera, color: 'bg-primary/10 text-primary' },
  student_work: { label: 'Student Work', icon: Film, color: 'bg-accent/10 text-accent' },
  stay_locations: { label: 'Stay Locations', icon: MapPin, color: 'bg-green-500/10 text-green-500' }
};

const mediaTypeConfig = {
  image: { label: 'Image', icon: ImageIcon },
  youtube: { label: 'YouTube', icon: Youtube },
  instagram: { label: 'Instagram', icon: Instagram }
};

const AdminRoadmapSidebar: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SidebarContentItem | null>(null);
  const [form, setForm] = useState<ContentForm>(initialForm);
  const [filter, setFilter] = useState<{ blockType: string; editionId: string }>({
    blockType: 'all',
    editionId: 'all'
  });

  // Fetch editions for dropdown
  const { data: editions } = useQuery({
    queryKey: ['editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch sidebar content
  const { data: sidebarContent, isLoading, refetch } = useQuery({
    queryKey: ['admin-roadmap-sidebar-content', filter],
    queryFn: async () => {
      let query = supabase
        .from('roadmap_sidebar_content')
        .select('*')
        .order('block_type')
        .order('order_index');

      if (filter.blockType !== 'all') {
        query = query.eq('block_type', filter.blockType);
      }
      if (filter.editionId !== 'all') {
        query = query.eq('edition_id', filter.editionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SidebarContentItem[];
    }
  });

  // Fetch content-edition mappings
  const { data: contentEditions, refetch: refetchEditions } = useQuery({
    queryKey: ['content-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id, edition_id');
      if (error) throw error;
      return data as ContentEdition[];
    }
  });

  // Get edition IDs for a specific content item
  const getEditionIdsForContent = (contentId: string): string[] => {
    return (contentEditions || [])
      .filter(ce => ce.content_id === contentId)
      .map(ce => ce.edition_id);
  };

  // Get edition names for display
  const getEditionNamesForContent = (contentId: string): string[] => {
    const editionIds = getEditionIdsForContent(contentId);
    if (editionIds.length === 0) return ['All Editions'];
    return editionIds
      .map(id => editions?.find(e => e.id === id)?.name || 'Unknown')
      .slice(0, 2);
  };

  const handleOpenDialog = async (item?: SidebarContentItem) => {
    if (item) {
      setEditingItem(item);
      const editionIds = getEditionIdsForContent(item.id);
      setForm({
        edition_ids: editionIds,
        block_type: item.block_type,
        title: item.title || '',
        media_url: item.media_url,
        media_type: item.media_type,
        caption: item.caption || '',
        order_index: item.order_index,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setForm(initialForm);
    }
    setIsDialogOpen(true);
  };

  const handleEditionToggle = (editionId: string) => {
    setForm(f => ({
      ...f,
      edition_ids: f.edition_ids.includes(editionId)
        ? f.edition_ids.filter(id => id !== editionId)
        : [...f.edition_ids, editionId]
    }));
  };

  const handleSave = async () => {
    if (!form.media_url) {
      toast.error('Media URL is required');
      return;
    }

    try {
      const payload = {
        edition_id: null, // Keep for backward compatibility but we use junction table now
        block_type: form.block_type,
        title: form.title || null,
        media_url: form.media_url,
        media_type: form.media_type,
        caption: form.caption || null,
        order_index: form.order_index,
        is_active: form.is_active
      };

      let contentId: string;

      if (editingItem) {
        const { error } = await supabase
          .from('roadmap_sidebar_content')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        contentId = editingItem.id;

        // Delete existing edition mappings
        await supabase
          .from('roadmap_sidebar_content_editions')
          .delete()
          .eq('content_id', contentId);
      } else {
        const { data, error } = await supabase
          .from('roadmap_sidebar_content')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        contentId = data.id;
      }

      // Insert new edition mappings
      if (form.edition_ids.length > 0) {
        const editionMappings = form.edition_ids.map(edition_id => ({
          content_id: contentId,
          edition_id
        }));

        const { error: mappingError } = await supabase
          .from('roadmap_sidebar_content_editions')
          .insert(editionMappings);

        if (mappingError) throw mappingError;
      }

      toast.success(editingItem ? 'Content updated successfully' : 'Content added successfully');
      setIsDialogOpen(false);
      refetch();
      refetchEditions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      // Junction table entries will be deleted via CASCADE
      const { error } = await supabase
        .from('roadmap_sidebar_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Content deleted');
      refetch();
      refetchEditions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const groupedContent = (sidebarContent || []).reduce((acc, item) => {
    if (!acc[item.block_type]) acc[item.block_type] = [];
    acc[item.block_type].push(item);
    return acc;
  }, {} as Record<string, SidebarContentItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roadmap Sidebar Content</h1>
          <p className="text-muted-foreground">Manage the highlights panel shown on the roadmap</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={filter.blockType} onValueChange={(v) => setFilter(f => ({ ...f, blockType: v }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="past_moments">Past Moments</SelectItem>
            <SelectItem value="student_work">Student Work</SelectItem>
            <SelectItem value="stay_locations">Stay Locations</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filter.editionId} onValueChange={(v) => setFilter(f => ({ ...f, editionId: v }))}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by edition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Editions</SelectItem>
            {editions?.map(edition => (
              <SelectItem key={edition.id} value={edition.id}>{edition.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(blockTypeConfig).map(([type, config]) => {
            const items = groupedContent[type] || [];
            const Icon = config.icon;
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold">{config.label}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                {items.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    No content added yet
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => {
                      const editionNames = getEditionNamesForContent(item.id);
                      const editionCount = getEditionIdsForContent(item.id).length;
                      
                      return (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="aspect-video bg-secondary/30 relative">
                            {item.media_type === 'image' ? (
                              <img 
                                src={item.media_url} 
                                alt={item.title || ''} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.media_type === 'youtube' ? (
                                  <Youtube className="w-12 h-12 text-red-500" />
                                ) : (
                                  <Instagram className="w-12 h-12 text-pink-500" />
                                )}
                              </div>
                            )}
                            {!item.is_active && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Badge variant="secondary">Inactive</Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{item.title || 'Untitled'}</p>
                                {item.caption && (
                                  <p className="text-xs text-muted-foreground truncate">{item.caption}</p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {editionNames.map((name, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                                      {name}
                                    </Badge>
                                  ))}
                                  {editionCount > 2 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      +{editionCount - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(item)}>
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Content' : 'Add Content'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Block Type</Label>
                <Select value={form.block_type} onValueChange={(v) => setForm(f => ({ ...f, block_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past_moments">Past Moments</SelectItem>
                    <SelectItem value="student_work">Student Work</SelectItem>
                    <SelectItem value="stay_locations">Stay Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Media Type</Label>
                <Select value={form.media_type} onValueChange={(v) => setForm(f => ({ ...f, media_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Editions</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select editions to show this content. Leave empty for all editions.
              </p>
              <Card className="p-2">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {editions?.map(edition => (
                      <div
                        key={edition.id}
                        className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded cursor-pointer"
                        onClick={() => handleEditionToggle(edition.id)}
                      >
                        <Checkbox
                          checked={form.edition_ids.includes(edition.id)}
                          onCheckedChange={() => handleEditionToggle(edition.id)}
                        />
                        <span className="text-sm">{edition.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
              {form.edition_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.edition_ids.map(id => {
                    const edition = editions?.find(e => e.id === id);
                    return edition ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={() => handleEditionToggle(id)}
                      >
                        {edition.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              {form.edition_ids.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Showing to all editions
                </p>
              )}
            </div>

            <div>
              <Label>Title (optional)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>

            <div>
              <Label>Media {form.media_type === 'image' ? '(Upload or URL)' : 'URL'} *</Label>
              {form.media_type === 'image' ? (
                <Tabs defaultValue="upload" className="mt-2">
                  <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger value="upload" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="text-xs">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-2">
                    <FileUpload
                      bucket="roadmap-assets"
                      accept="image/*"
                      maxSizeMB={10}
                      label=""
                      currentUrl={form.media_url?.startsWith('http') ? form.media_url : undefined}
                      onUploadComplete={(url) => setForm(f => ({ ...f, media_url: url }))}
                      helperText="Upload JPG, PNG, or WebP images up to 10MB"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      value={form.media_url}
                      onChange={(e) => setForm(f => ({ ...f, media_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <Input
                  value={form.media_url}
                  onChange={(e) => setForm(f => ({ ...f, media_url: e.target.value }))}
                  placeholder={form.media_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://instagram.com/p/...'}
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label>Caption (optional)</Label>
              <Textarea
                value={form.caption}
                onChange={(e) => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Short description or location name"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label>Active</Label>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoadmapSidebar;
