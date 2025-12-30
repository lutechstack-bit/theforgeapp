import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationType = Database['public']['Enums']['notification_type'];

export default function AdminNotifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(searchParams.get('action') === 'create');
  const queryClient = useQueryClient();

  // Fetch recent notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_global', true)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    }
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; type: NotificationType; link?: string }) => {
      const { error } = await supabase.from('notifications').insert({
        ...data,
        is_global: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notification sent successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsDialogOpen(false);
      setSearchParams({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const typeColors: Record<NotificationType, string> = {
    COMMUNITY: 'bg-blue-500/20 text-blue-400',
    LEARN: 'bg-purple-500/20 text-purple-400',
    EVENTS: 'bg-emerald-500/20 text-emerald-400',
    ROADMAP: 'bg-amber-500/20 text-amber-400',
    SYSTEM: 'bg-primary/20 text-primary'
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Push global notifications to all users</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Push Notification
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No notifications sent yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <Card key={notification.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={typeColors[notification.type]}>
                      {notification.type}
                    </Badge>
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {notification.link && (
                  <p className="text-xs text-primary mt-2">Link: {notification.link}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Notification Dialog */}
      <CreateNotificationDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSearchParams({});
        }}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

function CreateNotificationDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; message: string; type: NotificationType; link?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM' as NotificationType,
    link: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      link: formData.link || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Push Notification</DialogTitle>
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
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea
              required
              placeholder="Notification message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Link (optional)</Label>
            <Input
              placeholder="/learn or /events"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Send className="w-4 h-4 mr-2" />
            Send to All Users
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
