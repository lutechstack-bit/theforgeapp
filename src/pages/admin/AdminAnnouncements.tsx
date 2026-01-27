import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Megaphone, 
  Zap, 
  Save, 
  Trash2, 
  Loader2,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AnnouncementTrigger {
  id: string;
  trigger_type: string;
  title_template: string;
  message_template: string | null;
  deep_link: string | null;
  icon_emoji: string;
  is_active: boolean;
  priority: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface HeroNotification {
  id: string;
  title: string;
  body: string | null;
  message: string;
  deep_link: string | null;
  link: string | null;
  is_hero_announcement: boolean;
  icon_emoji: string | null;
  priority: number;
  pinned: boolean;
  expiry_at: string | null;
  created_at: string;
}

const AdminAnnouncements: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const queryClient = useQueryClient();
  const [selectedTrigger, setSelectedTrigger] = useState<AnnouncementTrigger | null>(null);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    body: '',
    deep_link: '',
    icon_emoji: '📢',
    priority: 5,
    expiry_at: '',
  });

  // Fetch triggers
  const { data: triggers, isLoading: triggersLoading } = useQuery({
    queryKey: ['admin_announcement_triggers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcement_triggers')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as AnnouncementTrigger[];
    },
    enabled: isAdmin,
  });

  // Fetch hero announcements
  const { data: heroAnnouncements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['admin_hero_announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_hero_announcement', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HeroNotification[];
    },
    enabled: isAdmin,
  });

  // Toggle trigger active state
  const toggleTriggerMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('announcement_triggers')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcement_triggers'] });
      toast.success('Trigger updated');
    },
    onError: () => {
      toast.error('Failed to update trigger');
    },
  });

  // Update trigger
  const updateTriggerMutation = useMutation({
    mutationFn: async (trigger: Partial<AnnouncementTrigger> & { id: string }) => {
      const { error } = await supabase
        .from('announcement_triggers')
        .update({ ...trigger, updated_at: new Date().toISOString() })
        .eq('id', trigger.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcement_triggers'] });
      toast.success('Trigger saved');
      setSelectedTrigger(null);
    },
    onError: () => {
      toast.error('Failed to save trigger');
    },
  });

  // Create hero announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcement: typeof newAnnouncement) => {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          title: announcement.title,
          body: announcement.body || null,
          message: announcement.body || announcement.title,
          deep_link: announcement.deep_link || null,
          icon_emoji: announcement.icon_emoji,
          priority: announcement.priority,
          is_hero_announcement: true,
          is_global: true,
          type: 'SYSTEM' as const,
          expiry_at: announcement.expiry_at || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_hero_announcements'] });
      toast.success('Announcement created');
      setIsCreatingAnnouncement(false);
      setNewAnnouncement({
        title: '',
        body: '',
        deep_link: '',
        icon_emoji: '📢',
        priority: 5,
        expiry_at: '',
      });
    },
    onError: () => {
      toast.error('Failed to create announcement');
    },
  });

  // Delete announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_hero_announcements'] });
      toast.success('Announcement deleted');
    },
    onError: () => {
      toast.error('Failed to delete announcement');
    },
  });

  if (adminLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Announcement Center</h1>
        <p className="text-muted-foreground">
          Manage hero announcements and smart triggers
        </p>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Manual Announcements
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Triggers
          </TabsTrigger>
        </TabsList>

        {/* Manual Announcements Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Hero Announcements</h2>
            <Button
              onClick={() => setIsCreatingAnnouncement(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          </div>

          {/* Create Announcement Form */}
          {isCreatingAnnouncement && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Create Announcement</CardTitle>
                <CardDescription>
                  This will appear in the hero banner for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Complete your KYF form!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon Emoji</Label>
                    <Input
                      value={newAnnouncement.icon_emoji}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, icon_emoji: e.target.value }))}
                      placeholder="📢"
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Message (optional)</Label>
                  <Textarea
                    value={newAnnouncement.body}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Additional details..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Deep Link (optional)</Label>
                    <Input
                      value={newAnnouncement.deep_link}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, deep_link: e.target.value }))}
                      placeholder="/kyf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={newAnnouncement.expiry_at}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expiry_at: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => createAnnouncementMutation.mutate(newAnnouncement)}
                    disabled={!newAnnouncement.title || createAnnouncementMutation.isPending}
                  >
                    {createAnnouncementMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Create Announcement
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingAnnouncement(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Announcements List */}
          {announcementsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : heroAnnouncements?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hero announcements yet. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {heroAnnouncements?.map((announcement) => (
                <Card key={announcement.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl">{announcement.icon_emoji || '📢'}</span>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground">{announcement.title}</h3>
                          {announcement.body && (
                            <p className="text-sm text-muted-foreground truncate">{announcement.body}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">Priority: {announcement.priority}</Badge>
                            {announcement.deep_link && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {announcement.deep_link}
                              </Badge>
                            )}
                            {announcement.expiry_at && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Expires: {format(new Date(announcement.expiry_at), 'MMM d, yyyy')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Smart Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Smart Trigger Rules</h2>
            <p className="text-sm text-muted-foreground">
              Configure automatic announcements based on user state
            </p>
          </div>

          {triggersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {triggers?.map((trigger) => (
                <Card key={trigger.id} className={!trigger.is_active ? 'opacity-60' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl">{trigger.icon_emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground capitalize">
                              {trigger.trigger_type.replace(/_/g, ' ')}
                            </h3>
                            <Badge variant={trigger.is_active ? 'default' : 'secondary'}>
                              {trigger.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trigger.title_template}
                          </p>
                          {trigger.message_template && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              {trigger.message_template}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">Priority: {trigger.priority}</Badge>
                            {trigger.deep_link && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {trigger.deep_link}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Config: {JSON.stringify(trigger.config)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={trigger.is_active}
                          onCheckedChange={(checked) => 
                            toggleTriggerMutation.mutate({ id: trigger.id, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnnouncements;
