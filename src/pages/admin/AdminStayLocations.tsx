import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, MapPin, Phone, X, ImagePlus, Upload, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload } from '@/components/admin/FileUpload';

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
  edition_id: string | null;
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
}

interface Edition {
  id: string;
  name: string;
  city: string;
}

const emptyLocation: Omit<StayLocation, 'id' | 'created_at'> = {
  edition_id: null,
  name: '',
  full_address: '',
  google_maps_url: '',
  contacts: [],
  notes: [],
  gallery_images: [],
  featured_image_url: '',
  order_index: 0,
  is_active: true,
};

const AdminStayLocations: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StayLocation | null>(null);
  const [formData, setFormData] = useState<Omit<StayLocation, 'id' | 'created_at'>>(emptyLocation);

  // Fetch editions for dropdown
  const { data: editions = [] } = useQuery({
    queryKey: ['editions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, city')
        .eq('is_archived', false)
        .order('name');
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Fetch stay locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['stay-locations-admin'],
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
      })) as StayLocation[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<StayLocation, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('stay_locations').insert([{
        ...data,
        contacts: data.contacts as unknown as any,
        notes: data.notes as unknown as any,
        gallery_images: data.gallery_images as unknown as any,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      toast.success('Stay location created');
      handleCloseDialog();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<StayLocation, 'id' | 'created_at'> }) => {
      const { error } = await supabase.from('stay_locations').update({
        ...data,
        contacts: data.contacts as unknown as any,
        notes: data.notes as unknown as any,
        gallery_images: data.gallery_images as unknown as any,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      toast.success('Stay location updated');
      handleCloseDialog();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stay_locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stay-locations-admin'] });
      toast.success('Stay location deleted');
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData(emptyLocation);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (location: StayLocation) => {
    setEditingLocation(location);
    setFormData({
      edition_id: location.edition_id,
      name: location.name,
      full_address: location.full_address || '',
      google_maps_url: location.google_maps_url || '',
      contacts: location.contacts,
      notes: location.notes,
      gallery_images: location.gallery_images,
      featured_image_url: location.featured_image_url || '',
      order_index: location.order_index,
      is_active: location.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData(emptyLocation);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Contact management
  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '' }]
    }));
  };

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  // Notes management
  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, '']
    }));
  };

  const updateNote = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.map((n, i) => i === index ? value : n)
    }));
  };

  const removeNote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index)
    }));
  };

  // Gallery management
  const addGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, { url: '', caption: '' }]
    }));
  };

  const updateGalleryImage = (index: number, field: 'url' | 'caption', value: string) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const getEditionName = (editionId: string | null) => {
    if (!editionId) return 'Global';
    const edition = editions.find(e => e.id === editionId);
    return edition ? `${edition.name} (${edition.city})` : 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stay Locations</h1>
          <p className="text-muted-foreground">Manage accommodation details for each edition</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Location Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : locations.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No stay locations yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your first stay location</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location.id} className={`overflow-hidden ${!location.is_active ? 'opacity-60' : ''}`}>
              {location.featured_image_url ? (
                <div className="h-40 bg-secondary/50">
                  <img 
                    src={location.featured_image_url} 
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(location)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(location.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {getEditionName(location.edition_id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Stay Location' : 'Add Stay Location'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Hotel/Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Taj Hotel & Convention Centre"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edition">Edition</Label>
                <Select
                  value={formData.edition_id || 'global'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, edition_id: v === 'global' ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select edition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (All Editions)</SelectItem>
                    {editions.map((edition) => (
                      <SelectItem key={edition.id} value={edition.id}>
                        {edition.name} ({edition.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input
                  id="google_maps_url"
                  value={formData.google_maps_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="full_address">Full Address</Label>
                <Textarea
                  id="full_address"
                  value={formData.full_address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
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
                <Tabs defaultValue={formData.featured_image_url ? 'url' : 'upload'} className="mt-2">
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
                      currentUrl={formData.featured_image_url || undefined}
                      onUploadComplete={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                      label=""
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-2 space-y-2">
                    <Input
                      value={formData.featured_image_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.featured_image_url && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <img src={formData.featured_image_url} alt="Preview" className="w-full h-full object-cover" />
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
              {formData.contacts.map((contact, index) => (
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
              {formData.notes.map((note, index) => (
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

            {/* Gallery Section with Upload/URL tabs per image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Gallery Images</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Add Image
                </Button>
              </div>
              {formData.gallery_images.map((img, index) => (
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
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingLocation ? 'Save Changes' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStayLocations;
