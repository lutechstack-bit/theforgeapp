import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Image, Pencil, Trash2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  pinned: boolean;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  audience: string;
  created_by: string | null;
  created_at: string;
}

type BannerFormData = Omit<HeroBanner, 'id' | 'created_at' | 'created_by'>;

const defaultFormData: BannerFormData = {
  title: '',
  subtitle: '',
  image_url: '',
  cta_text: '',
  cta_link: '',
  pinned: false,
  priority: 0,
  start_at: null,
  end_at: null,
  audience: 'ALL'
};

export default function AdminHeroBanners() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-hero-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HeroBanner[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const { error } = await supabase.from('hero_banners').insert({
        ...data,
        created_by: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner created');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-banners'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BannerFormData }) => {
      const { error } = await supabase
        .from('hero_banners')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner updated');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-banners'] });
      setIsDialogOpen(false);
      setEditingBanner(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-banners'] });
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hero Banners</h1>
          <p className="text-muted-foreground mt-1">Manage featured banners on the home page</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : banners?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No banners created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners?.map((banner) => (
            <Card key={banner.id} className="bg-card/50 border-border/50 overflow-hidden">
              {banner.image_url && (
                <div className="h-32 overflow-hidden">
                  <img 
                    src={banner.image_url} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {banner.pinned && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Priority: {banner.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {banner.audience}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(banner)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(banner.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">{banner.title}</CardTitle>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                )}
                {banner.cta_text && (
                  <p className="text-xs text-primary mt-2">CTA: {banner.cta_text} → {banner.cta_link}</p>
                )}
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  {banner.start_at && <span>Starts: {format(new Date(banner.start_at), 'MMM d')}</span>}
                  {banner.end_at && <span>Ends: {format(new Date(banner.end_at), 'MMM d')}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BannerFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        banner={editingBanner}
        onSubmit={(data) => {
          if (editingBanner) {
            updateMutation.mutate({ id: editingBanner.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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

function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: () => void;
  banner: HeroBanner | null;
  onSubmit: (data: BannerFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);

  React.useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image_url: banner.image_url || '',
        cta_text: banner.cta_text || '',
        cta_link: banner.cta_link || '',
        pinned: banner.pinned,
        priority: banner.priority,
        start_at: banner.start_at,
        end_at: banner.end_at,
        audience: banner.audience
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [banner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url || null,
      cta_text: formData.cta_text || null,
      cta_link: formData.cta_link || null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              placeholder="Banner title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              placeholder="Optional subtitle"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              placeholder="https://..."
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input
                placeholder="View Now"
                value={formData.cta_text || ''}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input
                placeholder="/learn"
                value={formData.cta_link || ''}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={formData.audience}
                onValueChange={(value) => setFormData({ ...formData, audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PREVIEW">Preview Only</SelectItem>
                  <SelectItem value="FULL">Full Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={formData.start_at ? formData.start_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={formData.end_at ? formData.end_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.pinned}
              onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
            />
            <Label>Pinned (always show first)</Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {banner ? 'Update Banner' : 'Create Banner'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}