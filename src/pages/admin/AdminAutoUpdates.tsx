import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Bell, Pencil, Trash2, Pin } from 'lucide-react';
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
import type { Database } from '@/integrations/supabase/types';

type NotificationType = Database['public']['Enums']['notification_type'];

interface AutoUpdate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  body: string | null;
  deep_link: string | null;
  expiry_at: string | null;
  pinned: boolean;
  priority: number;
  auto_update: boolean;
  created_by: string | null;
  created_at: string;
}

interface FormData {
  type: NotificationType;
  title: string;
  message: string;
  body: string;
  deep_link: string;
  expiry_at: string | null;
  pinned: boolean;
  priority: number;
}

const defaultFormData: FormData = {
  type: 'SYSTEM',
  title: '',
  message: '',
  body: '',
  deep_link: '',
  expiry_at: null,
  pinned: false,
  priority: 0
};

const typeColors: Record<NotificationType, string> = {
  COMMUNITY: 'bg-blue-500/20 text-blue-400',
  LEARN: 'bg-purple-500/20 text-purple-400',
  EVENTS: 'bg-emerald-500/20 text-emerald-400',
  ROADMAP: 'bg-amber-500/20 text-amber-400',
  SYSTEM: 'bg-primary/20 text-primary'
};

export default function AdminAutoUpdates() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<AutoUpdate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['admin-auto-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('auto_update', true)
        .order('pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AutoUpdate[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('notifications').insert({
        ...data,
        body: data.body || null,
        deep_link: data.deep_link || null,
        auto_update: true,
        is_global: true,
        created_by: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Auto update created');
      queryClient.invalidateQueries({ queryKey: ['admin-auto-updates'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase
        .from('notifications')
        .update({
          ...data,
          body: data.body || null,
          deep_link: data.deep_link || null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Auto update updated');
      queryClient.invalidateQueries({ queryKey: ['admin-auto-updates'] });
      setIsDialogOpen(false);
      setEditingUpdate(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Auto update deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-auto-updates'] });
      setDeleteId(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const handleEdit = (update: AutoUpdate) => {
    setEditingUpdate(update);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUpdate(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auto Updates</h1>
          <p className="text-muted-foreground mt-1">Manage "What's New" notifications on home page</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Update
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : updates?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No auto updates created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates?.map((update) => (
            <Card key={update.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {update.pinned && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <Badge className={typeColors[update.type]}>
                      {update.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Priority: {update.priority}
                    </Badge>
                    {update.expiry_at && new Date(update.expiry_at) < new Date() && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(update)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(update.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">{update.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{update.message}</p>
                {update.body && (
                  <p className="text-xs text-muted-foreground mt-1">{update.body}</p>
                )}
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  {update.deep_link && <span>Link: {update.deep_link}</span>}
                  {update.expiry_at && <span>Expires: {format(new Date(update.expiry_at), 'MMM d, yyyy')}</span>}
                  <span>Created: {format(new Date(update.created_at), 'MMM d, h:mm a')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UpdateFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        update={editingUpdate}
        onSubmit={(data) => {
          if (editingUpdate) {
            updateMutation.mutate({ id: editingUpdate.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Update?</AlertDialogTitle>
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

function UpdateFormDialog({
  open,
  onOpenChange,
  update,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: () => void;
  update: AutoUpdate | null;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  React.useEffect(() => {
    if (update) {
      setFormData({
        type: update.type,
        title: update.title,
        message: update.message,
        body: update.body || '',
        deep_link: update.deep_link || '',
        expiry_at: update.expiry_at,
        pinned: update.pinned,
        priority: update.priority
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [update, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{update ? 'Edit Update' : 'Create Update'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: NotificationType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="COMMUNITY">Community</SelectItem>
                <SelectItem value="LEARN">Learn</SelectItem>
                <SelectItem value="EVENTS">Events</SelectItem>
                <SelectItem value="ROADMAP">Roadmap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              placeholder="Update title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Short Message *</Label>
            <Input
              required
              placeholder="Brief message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Body (extended)</Label>
            <Textarea
              placeholder="Optional longer description"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Deep Link</Label>
            <Input
              placeholder="/learn or /events/123"
              value={formData.deep_link}
              onChange={(e) => setFormData({ ...formData, deep_link: e.target.value })}
            />
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
              <Label>Expiry Date</Label>
              <Input
                type="datetime-local"
                value={formData.expiry_at ? formData.expiry_at.slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, expiry_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.pinned}
              onCheckedChange={(checked) => setFormData({ ...formData, pinned: checked })}
            />
            <Label>Pinned (always show first, never randomized)</Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {update ? 'Update' : 'Create Update'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}