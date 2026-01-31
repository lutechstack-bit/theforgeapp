import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit2, Trash2, Loader2, Camera, Film, MapPin,
  Image as ImageIcon, Youtube, Instagram, Save, X, Upload, Check, ImagePlus, Link, Pencil
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
import { Skeleton } from '@/components/ui/skeleton';

// ===== CONTENT TYPES (Past Moments, Student Work) =====
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

const initialContentForm: ContentForm = {
  edition_ids: [],
  block_type: 'past_moments',
  title: '',
  media_url: '',
  media_type: 'image',
  caption: '',
  order_index: 0,
  is_active: true
};

// ===== STAY LOCATION TYPES =====
interface Contact {
  name: string;
  phone: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface StayLocation {
  id: string;
  name: string;
  full_address: string | null;
  google_maps_url: string | null;
  contacts: Contact[];
  notes: string[];
  gallery_images: GalleryImage[];
  featured_image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  edition_ids: string[];
}

interface StayLocationForm {
  name: string;
  full_address: string;
  google_maps_url: string;
  contacts: Contact[];
  notes: string[];
  gallery_images: GalleryImage[];
  featured_image_url: string;
  order_index: number;
  is_active: boolean;
  edition_ids: string[];
}

const initialStayLocationForm: StayLocationForm = {
  name: '',
  full_address: '',
  google_maps_url: '',
  contacts: [],
  notes: [],
  gallery_images: [],
  featured_image_url: '',
  order_index: 0,
  is_active: true,
  edition_ids: [],
};

// ===== CONFIG =====
const blockTypeConfig = {
  past_moments: { label: 'Past Moments', icon: Camera, color: 'bg-primary/10 text-primary' },
  student_work: { label: 'Student Work', icon: Film, color: 'bg-accent/10 text-accent' },
};

const mediaTypeConfig = {
  image: { label: 'Image', icon: ImageIcon },
  youtube: { label: 'YouTube', icon: Youtube },
  instagram: { label: 'Instagram', icon: Instagram }
};

const AdminRoadmapSidebar: React.FC = () => {
  const queryClient = useQueryClient();
  
  // ===== CONTENT STATE =====
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<SidebarContentItem | null>(null);
  const [contentForm, setContentForm] = useState<ContentForm>(initialContentForm);
  const [contentFilter, setContentFilter] = useState<{ blockType: string; editionId: string }>({
    blockType: 'all',
    editionId: 'all'
  });

  // ===== STAY LOCATION STATE =====
  const [isStayDialogOpen, setIsStayDialogOpen] = useState(false);
  const [editingStayLocation, setEditingStayLocation] = useState<StayLocation | null>(null);
  const [stayForm, setStayForm] = useState<StayLocationForm>(initialStayLocationForm);

  // ===== SHARED QUERIES =====
  const { data: editions } = useQuery({
    queryKey: ['editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, city')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // ===== CONTENT QUERIES =====
  const { data: sidebarContent, isLoading: isContentLoading, refetch: refetchContent } = useQuery({
    queryKey: ['admin-roadmap-sidebar-content', contentFilter],
    queryFn: async () => {
      let query = supabase
        .from('roadmap_sidebar_content')
        .select('*')
        .neq('block_type', 'stay_locations') // Exclude stay_locations - they use a separate table
        .order('block_type')
        .order('order_index');

      if (contentFilter.blockType !== 'all') {
        query = query.eq('block_type', contentFilter.blockType);
      }
      if (contentFilter.editionId !== 'all') {
        query = query.eq('edition_id', contentFilter.editionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SidebarContentItem[];
    }
  });

  const { data: contentEditions, refetch: refetchContentEditions } = useQuery({
    queryKey: ['content-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id, edition_id');
      if (error) throw error;
      return data as ContentEdition[];
    }
  });

  // ===== STAY LOCATION QUERIES =====
  const { data: stayEditionMappings = [] } = useQuery({
    queryKey: ['stay-location-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stay_location_editions')
        .select('stay_location_id, edition_id');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stayLocations = [], isLoading: isStayLoading } = useQuery({
    queryKey: ['stay-locations-admin', stayEditionMappings],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stay_locations')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return (data || []).map(loc => ({
        ...loc,
        contacts: (loc.contacts as unknown as Contact[]) || [],
        notes: (loc.notes as unknown as string[]) || [],
        gallery_images: (loc.gallery_images as unknown as GalleryImage[]) || [],
        edition_ids: stayEditionMappings
          .filter(m => m.stay_location_id === loc.id)
          .map(m => m.edition_id),
      })) as StayLocation[];
    },
    enabled: stayEditionMappings !== undefined
  });

  // ===== CONTENT HELPERS =====
  const getEditionIdsForContent = (contentId: string): string[] => {
    return (contentEditions || [])
      .filter(ce => ce.content_id === contentId)
      .map(ce => ce.edition_id);
  };

  const getEditionNamesForContent = (contentId: string): string[] => {
    const editionIds = getEditionIdsForContent(contentId);
    if (editionIds.length === 0) return ['All Editions'];
    return editionIds
      .map(id => editions?.find(e => e.id === id)?.name || 'Unknown')
      .slice(0, 2);
  };

  // ===== CONTENT HANDLERS =====
  const handleOpenContentDialog = (item?: SidebarContentItem) => {
    if (item) {
      setEditingContentItem(item);
      const editionIds = getEditionIdsForContent(item.id);
      setContentForm({
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
      setEditingContentItem(null);
      setContentForm(initialContentForm);
    }
    setIsContentDialogOpen(true);
  };

  const handleContentEditionToggle = (editionId: string) => {
    setContentForm(f => ({
      ...f,
      edition_ids: f.edition_ids.includes(editionId)
        ? f.edition_ids.filter(id => id !== editionId)
        : [...f.edition_ids, editionId]
    }));
  };

  const handleSaveContent = async () => {
    if (!contentForm.media_url) {
      toast.error('Media URL is required');
      return;
    }

    try {
      const payload = {
        edition_id: null,
        block_type: contentForm.block_type,
        title: contentForm.title || null,
        media_url: contentForm.media_url,
        media_type: contentForm.media_type,
        caption: contentForm.caption || null,
        order_index: contentForm.order_index,
        is_active: contentForm.is_active
      };

      let contentId: string;

      if (editingContentItem) {
        const { error } = await supabase
          .from('roadmap_sidebar_content')
          .update(payload)
          .eq('id', editingContentItem.id);
        if (error) throw error;
        contentId = editingContentItem.id;

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

      if (contentForm.edition_ids.length > 0) {
        const editionMappings = contentForm.edition_ids.map(edition_id => ({
          content_id: contentId,
          edition_id
        }));

        const { error: mappingError } = await supabase
          .from('roadmap_sidebar_content_editions')
          .insert(editionMappings);

        if (mappingError) throw mappingError;
      }

      toast.success(editingContentItem ? 'Content updated successfully' : 'Content added successfully');
      setIsContentDialogOpen(false);
      refetchContent();
      refetchContentEditions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('roadmap_sidebar_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Content deleted');
      refetchContent();
      refetchContentEditions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const groupedContent = (sidebarContent || []).reduce((acc, item) => {
    if (!acc[item.block_type]) acc[item.block_type] = [];
    acc[item.block_type].push(item);
    return acc;
  }, {} as Record<string, SidebarContentItem[]>);

  // ===== STAY LOCATION MUTATIONS =====
  const createStayMutation = useMutation({
    mutationFn: async (data: StayLocationForm) => {
      const { edition_ids, ...locationData } = data;
      
      const { data: newLocation, error } = await supabase
        .from('stay_locations')
        .insert([{
          ...locationData,
          contacts: locationData.contacts as unknown as any,
          notes: locationData.notes as unknown as any,
          gallery_images: locationData.gallery_images as unknown as any,
        }])
        .select('id')
        .single();
      if (error) throw error;

      if (edition_ids.length > 0) {
        const { error: mappingError } = await supabase
          .from('stay_location_editions')
          .insert(edition_ids.map(edition_id => ({
            stay_location_id: newLocation.id,
            edition_id,
          })));
        if (mappingError) throw mappingError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['stay-location-editions'] });
      toast.success('Stay location created');
      handleCloseStayDialog();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const updateStayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StayLocationForm }) => {
      const { edition_ids, ...locationData } = data;
      
      const { error } = await supabase
        .from('stay_locations')
        .update({
          ...locationData,
          contacts: locationData.contacts as unknown as any,
          notes: locationData.notes as unknown as any,
          gallery_images: locationData.gallery_images as unknown as any,
        })
        .eq('id', id);
      if (error) throw error;

      const { error: deleteError } = await supabase
        .from('stay_location_editions')
        .delete()
        .eq('stay_location_id', id);
      if (deleteError) throw deleteError;

      if (edition_ids.length > 0) {
        const { error: mappingError } = await supabase
          .from('stay_location_editions')
          .insert(edition_ids.map(edition_id => ({
            stay_location_id: id,
            edition_id,
          })));
        if (mappingError) throw mappingError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['stay-location-editions'] });
      toast.success('Stay location updated');
      handleCloseStayDialog();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const deleteStayMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stay_locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['stay-location-editions'] });
      toast.success('Stay location deleted');
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  // ===== STAY LOCATION HANDLERS =====
  const handleOpenStayCreate = () => {
    setEditingStayLocation(null);
    setStayForm(initialStayLocationForm);
    setIsStayDialogOpen(true);
  };

  const handleOpenStayEdit = (location: StayLocation) => {
    setEditingStayLocation(location);
    setStayForm({
      name: location.name,
      full_address: location.full_address || '',
      google_maps_url: location.google_maps_url || '',
      contacts: location.contacts,
      notes: location.notes,
      gallery_images: location.gallery_images,
      featured_image_url: location.featured_image_url || '',
      order_index: location.order_index,
      is_active: location.is_active,
      edition_ids: location.edition_ids,
    });
    setIsStayDialogOpen(true);
  };

  const handleCloseStayDialog = () => {
    setIsStayDialogOpen(false);
    setEditingStayLocation(null);
    setStayForm(initialStayLocationForm);
  };

  const handleStayEditionToggle = (editionId: string) => {
    setStayForm(prev => ({
      ...prev,
      edition_ids: prev.edition_ids.includes(editionId)
        ? prev.edition_ids.filter(id => id !== editionId)
        : [...prev.edition_ids, editionId]
    }));
  };

  const handleSubmitStay = () => {
    if (!stayForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingStayLocation) {
      updateStayMutation.mutate({ id: editingStayLocation.id, data: stayForm });
    } else {
      createStayMutation.mutate(stayForm);
    }
  };

  // Stay location form helpers
  const addContact = () => {
    setStayForm(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '' }]
    }));
  };

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    setStayForm(prev => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const removeContact = (index: number) => {
    setStayForm(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const addNote = () => {
    setStayForm(prev => ({
      ...prev,
      notes: [...prev.notes, '']
    }));
  };

  const updateNote = (index: number, value: string) => {
    setStayForm(prev => ({
      ...prev,
      notes: prev.notes.map((n, i) => i === index ? value : n)
    }));
  };

  const removeNote = (index: number) => {
    setStayForm(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  };

  const addGalleryImage = () => {
    setStayForm(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, { url: '', caption: '' }]
    }));
  };

  const updateGalleryImage = (index: number, field: 'url' | 'caption', value: string) => {
    setStayForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.map((img, i) => i === index ? { ...img, [field]: value } : img)
    }));
  };

  const removeGalleryImage = (index: number) => {
    setStayForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const getStayEditionDisplay = (editionIds: string[]) => {
    if (editionIds.length === 0) return 'All Editions';
    if (editionIds.length === 1) {
      const edition = editions?.find(e => e.id === editionIds[0]);
      return edition ? edition.name : '1 edition';
    }
    return `${editionIds.length} editions`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roadmap Sidebar</h1>
        <p className="text-muted-foreground">Manage the highlights panel shown on the roadmap</p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="content" className="gap-2">
            <Camera className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="stay-locations" className="gap-2">
            <MapPin className="w-4 h-4" />
            Stay Locations
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <Select value={contentFilter.blockType} onValueChange={(v) => setContentFilter(f => ({ ...f, blockType: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="past_moments">Past Moments</SelectItem>
                  <SelectItem value="student_work">Student Work</SelectItem>
                </SelectContent>
              </Select>

              <Select value={contentFilter.editionId} onValueChange={(v) => setContentFilter(f => ({ ...f, editionId: v }))}>
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

            <Button onClick={() => handleOpenContentDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>

          {isContentLoading ? (
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
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenContentDialog(item)}>
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteContent(item.id)}>
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
        </TabsContent>

        {/* Stay Locations Tab */}
        <TabsContent value="stay-locations" className="space-y-6 mt-6">
          <div className="flex items-center justify-end">
            <Button onClick={handleOpenStayCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isStayLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : stayLocations.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No stay locations yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Create your first stay location</p>
                  <Button onClick={handleOpenStayCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </CardContent>
              </Card>
            ) : (
              stayLocations.map((location) => (
                <Card key={location.id} className={`overflow-hidden ${!location.is_active ? 'opacity-60' : ''}`}>
                  {location.featured_image_url || location.gallery_images[0]?.url ? (
                    <div className="h-40 bg-secondary/50">
                      <img 
                        src={location.featured_image_url || location.gallery_images[0]?.url} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-secondary/50 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{location.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {location.full_address || 'No address'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenStayEdit(location)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteStayMutation.mutate(location.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {getStayEditionDisplay(location.edition_ids)}
                      </span>
                      {location.contacts.length > 0 && (
                        <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          {location.contacts.length} contacts
                        </span>
                      )}
                      {location.notes.length > 0 && (
                        <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          {location.notes.length} notes
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContentItem ? 'Edit Content' : 'Add Content'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Block Type</Label>
                <Select value={contentForm.block_type} onValueChange={(v) => setContentForm(f => ({ ...f, block_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past_moments">Past Moments</SelectItem>
                    <SelectItem value="student_work">Student Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Media Type</Label>
                <Select value={contentForm.media_type} onValueChange={(v) => setContentForm(f => ({ ...f, media_type: v }))}>
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
                        onClick={() => handleContentEditionToggle(edition.id)}
                      >
                        <Checkbox
                          checked={contentForm.edition_ids.includes(edition.id)}
                          onCheckedChange={() => handleContentEditionToggle(edition.id)}
                        />
                        <span className="text-sm">{edition.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
              {contentForm.edition_ids.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {contentForm.edition_ids.map(id => {
                    const edition = editions?.find(e => e.id === id);
                    return edition ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={() => handleContentEditionToggle(id)}
                      >
                        {edition.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              {contentForm.edition_ids.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Showing to all editions
                </p>
              )}
            </div>

            <div>
              <Label>Title (optional)</Label>
              <Input
                value={contentForm.title}
                onChange={(e) => setContentForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>

            <div>
              <Label>Media {contentForm.media_type === 'image' ? '(Upload or URL)' : 'URL'} *</Label>
              {contentForm.media_type === 'image' ? (
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
                      currentUrl={contentForm.media_url?.startsWith('http') ? contentForm.media_url : undefined}
                      onUploadComplete={(url) => setContentForm(f => ({ ...f, media_url: url }))}
                      helperText="Upload JPG, PNG, or WebP images up to 10MB"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      value={contentForm.media_url}
                      onChange={(e) => setContentForm(f => ({ ...f, media_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <Input
                  value={contentForm.media_url}
                  onChange={(e) => setContentForm(f => ({ ...f, media_url: e.target.value }))}
                  placeholder={contentForm.media_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://instagram.com/p/...'}
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label>Caption (optional)</Label>
              <Textarea
                value={contentForm.caption}
                onChange={(e) => setContentForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Short description or location name"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={contentForm.order_index}
                  onChange={(e) => setContentForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label>Active</Label>
                <Switch
                  checked={contentForm.is_active}
                  onCheckedChange={(v) => setContentForm(f => ({ ...f, is_active: v }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stay Location Dialog */}
      <Dialog open={isStayDialogOpen} onOpenChange={setIsStayDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStayLocation ? 'Edit Stay Location' : 'Add Stay Location'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Hotel/Location Name *</Label>
                <Input
                  id="name"
                  value={stayForm.name}
                  onChange={(e) => setStayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Taj Hotel & Convention Centre"
                />
              </div>
              
              {/* Multi-Edition Selection */}
              <div className="md:col-span-2 space-y-2">
                <Label>Editions</Label>
                <p className="text-xs text-muted-foreground">
                  Select editions where this location should appear. Leave empty for all editions.
                </p>
                <Card className="p-0 overflow-hidden">
                  <ScrollArea className="h-[140px]">
                    {editions?.map(edition => (
                      <label
                        key={edition.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      >
                        <Checkbox
                          checked={stayForm.edition_ids.includes(edition.id)}
                          onCheckedChange={() => handleStayEditionToggle(edition.id)}
                        />
                        <span className="text-sm">{edition.name} ({edition.city})</span>
                      </label>
                    ))}
                  </ScrollArea>
                </Card>
                
                {stayForm.edition_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stayForm.edition_ids.map(id => {
                      const edition = editions?.find(e => e.id === id);
                      return edition ? (
                        <Badge key={id} variant="secondary" className="gap-1 text-xs">
                          {edition.name}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => handleStayEditionToggle(id)} 
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                
                {stayForm.edition_ids.length === 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    Will show for all editions
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input
                  id="google_maps_url"
                  value={stayForm.google_maps_url || ''}
                  onChange={(e) => setStayForm(prev => ({ ...prev, google_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="full_address">Full Address</Label>
                <Textarea
                  id="full_address"
                  value={stayForm.full_address || ''}
                  onChange={(e) => setStayForm(prev => ({ ...prev, full_address: e.target.value }))}
                  placeholder="Copy the full address from Google Maps here"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the complete address from Google Maps
                </p>
              </div>

              {/* Featured Image with Upload/URL tabs */}
              <div className="md:col-span-2">
                <Label>Featured Image</Label>
                <Tabs defaultValue={stayForm.featured_image_url ? 'url' : 'upload'} className="mt-2">
                  <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="upload" className="text-xs gap-1">
                      <Upload className="w-3 h-3" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="text-xs gap-1">
                      <Link className="w-3 h-3" /> URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-2">
                    <FileUpload
                      bucket="roadmap-assets"
                      accept="image/*"
                      maxSizeMB={10}
                      currentUrl={stayForm.featured_image_url || undefined}
                      onUploadComplete={(url) => setStayForm(prev => ({ ...prev, featured_image_url: url }))}
                      label=""
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-2 space-y-2">
                    <Input
                      value={stayForm.featured_image_url || ''}
                      onChange={(e) => setStayForm(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    {stayForm.featured_image_url && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <img src={stayForm.featured_image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Contacts Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Contacts</Label>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </Button>
              </div>
              {stayForm.contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContact(index)}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Things to Keep in Mind</Label>
                <Button type="button" variant="outline" size="sm" onClick={addNote}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>
              {stayForm.notes.map((note, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-muted-foreground text-sm pt-2">{index + 1}.</span>
                  <Textarea
                    value={note}
                    onChange={(e) => updateNote(index, e.target.value)}
                    placeholder="Enter a note or tip..."
                    className="flex-1 min-h-[60px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNote(index)}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Gallery Images</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Add Image
                </Button>
              </div>
              {stayForm.gallery_images.map((img, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Image {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGalleryImage(index)}
                      className="text-destructive h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Tabs defaultValue={img.url ? 'url' : 'upload'} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                      <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                      <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-2">
                      <FileUpload
                        bucket="roadmap-assets"
                        accept="image/*"
                        maxSizeMB={10}
                        currentUrl={img.url || undefined}
                        onUploadComplete={(url) => updateGalleryImage(index, 'url', url)}
                        label=""
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-2">
                      <Input
                        value={img.url}
                        onChange={(e) => updateGalleryImage(index, 'url', e.target.value)}
                        placeholder="Image URL"
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <Input
                    value={img.caption || ''}
                    onChange={(e) => updateGalleryImage(index, 'caption', e.target.value)}
                    placeholder="Caption (optional)"
                  />
                  
                  {img.url && (
                    <img src={img.url} alt="" className="w-full h-24 object-cover rounded" />
                  )}
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">Show this location to users</p>
              </div>
              <Switch
                id="is_active"
                checked={stayForm.is_active}
                onCheckedChange={(checked) => setStayForm(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseStayDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitStay}
              disabled={createStayMutation.isPending || updateStayMutation.isPending}
            >
              {editingStayLocation ? 'Save Changes' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoadmapSidebar;
