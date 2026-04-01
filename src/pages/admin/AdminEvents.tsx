import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar, MapPin, Video, FileText, Users, Bell, ArrowRightLeft } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { FileUpload } from '@/components/admin/FileUpload';
import { DateTimePicker } from '@/components/admin/DateTimePicker';
import { EventRegistrationsModal } from '@/components/admin/EventRegistrationsModal';

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
  is_virtual: boolean;
  event_type_id: string | null;
  recording_url: string;
  notes: string;
  show_on_homepage: boolean;
  zoom_link: string;
  host_name: string;
  host_avatar_url: string;
  host_designation: string;
}

const initialForm: EventForm = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  image_url: '',
  is_virtual: false,
  event_type_id: null,
  recording_url: '',
  notes: '',
  show_on_homepage: false,
  zoom_link: '',
  host_name: '',
  host_avatar_url: '',
  host_designation: '',
};

const AdminEvents: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [registrationsModal, setRegistrationsModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
  const [convertDialog, setConvertDialog] = useState<any>(null);
  const [convertVideoUrl, setConvertVideoUrl] = useState('');

  const { data: eventTypes = [] } = useQuery({
    queryKey: ['admin-event-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('event_types').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`*, event_types (id, name)`)
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: registrationCounts = {} } = useQuery({
    queryKey: ['event-registration-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('event_registrations').select('event_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((r) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: EventForm & { isNew?: boolean }) => {
      const { isNew, ...formData } = data;
      const payload: any = { ...formData };
      if (!payload.event_type_id) delete payload.event_type_id;

      if (editingId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase.from('events').insert(payload).select().single();
        if (error) throw error;

        // Auto-create notification on new event
        if (created) {
          await supabase.from('notifications').insert({
            title: `New Event: ${formData.title}`,
            message: `Happening on ${formData.event_date ? format(new Date(formData.event_date), 'MMM d, yyyy') : 'TBD'}`,
            is_global: true,
            deep_link: `/events/${created.id}`,
            type: 'EVENTS' as const,
            icon_emoji: '🎉',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(editingId ? 'Event updated' : 'Event created & notification sent');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save event: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete event: ' + error.message);
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (event: any) => {
      const { error } = await supabase.from('notifications').insert({
        title: `Reminder: ${event.title}`,
        message: `Don't forget — happening ${format(new Date(event.event_date), 'MMM d')} at ${format(new Date(event.event_date), 'h:mm a')}`,
        is_global: true,
        deep_link: `/events/${event.id}`,
        type: 'info',
        icon_emoji: '⏰',
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success('Reminder notification sent!'),
    onError: (error) => toast.error('Failed: ' + error.message),
  });

  const convertMutation = useMutation({
    mutationFn: async ({ event, videoUrl }: { event: any; videoUrl: string }) => {
      // Create learn_content entry
      const { data: session, error: insertError } = await supabase.from('learn_content').insert({
        title: event.title,
        thumbnail_url: event.image_url,
        instructor_name: event.host_name || 'Forge Team',
        instructor_avatar_url: event.host_avatar_url || null,
        company_name: (event as any).host_designation || null,
        section_type: 'community_sessions',
        card_layout: 'portrait',
        category: 'community',
        video_url: videoUrl,
        video_source_type: 'upload',
        linked_event_id: event.id,
        description: event.description || null,
      } as any).select().single();
      if (insertError) throw insertError;

      // Update event with community_session_id
      const { error: updateError } = await supabase
        .from('events')
        .update({ community_session_id: session.id } as any)
        .eq('id', event.id);
      if (updateError) throw updateError;

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['learn-content'] });
      toast.success('Community session created!');
      setConvertDialog(null);
      setConvertVideoUrl('');
    },
    onError: (error) => toast.error('Failed: ' + error.message),
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: any) => {
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      location: event.location || '',
      image_url: event.image_url || '',
      is_virtual: event.is_virtual,
      event_type_id: event.event_type_id || null,
      recording_url: event.recording_url || '',
      notes: event.notes || '',
      show_on_homepage: event.show_on_homepage || false,
      zoom_link: event.zoom_link || '',
      host_name: event.host_name || '',
      host_avatar_url: event.host_avatar_url || '',
      host_designation: event.host_designation || '',
    });
    setEditingId(event.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_date || isNaN(new Date(form.event_date).getTime())) {
      toast.error('Please select a valid date and time');
      return;
    }
    saveMutation.mutate({ ...form, isNew: !editingId });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events Management</h1>
          <p className="text-muted-foreground">Create and manage events for your community</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Event' : 'Create Event'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the event details below' : 'Fill in the event details below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <FloatingInput
                id="title"
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  value={form.event_type_id || ''}
                  onValueChange={(value) => setForm({ ...form, event_type_id: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FloatingTextarea
                id="description"
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />

              <div>
                <Label>Date & Time</Label>
                <DateTimePicker
                  value={form.event_date}
                  onChange={(isoString) => setForm({ ...form, event_date: isoString })}
                />
              </div>

              <FloatingInput
                id="location"
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              {/* Host Info */}
              <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Host Info</h4>
                <FloatingInput
                  id="host_name"
                  label="Host Name"
                  value={form.host_name}
                  onChange={(e) => setForm({ ...form, host_name: e.target.value })}
                />
                <FloatingInput
                  id="host_designation"
                  label="Host Designation (e.g. Sound Designer)"
                  value={form.host_designation}
                  onChange={(e) => setForm({ ...form, host_designation: e.target.value })}
                />
                <div>
                  <Label>Host Avatar</Label>
                  <FileUpload
                    bucket="event-images"
                    accept="image/*"
                    maxSizeMB={5}
                    label=""
                    helperText="Upload host photo"
                    currentUrl={form.host_avatar_url}
                    onUploadComplete={(url) => setForm({ ...form, host_avatar_url: url })}
                  />
                </div>
              </div>

              <div>
                <Label>Event Poster (1:1 square)</Label>
                <FileUpload
                  bucket="event-images"
                  accept="image/*"
                  maxSizeMB={10}
                  label=""
                  helperText="Upload poster card, 1:1 square recommended"
                  currentUrl={form.image_url}
                  onUploadComplete={(url) => setForm({ ...form, image_url: url })}
                />
              </div>

              {/* Zoom Link */}
              <FloatingInput
                id="zoom_link"
                label="Zoom Link"
                value={form.zoom_link}
                onChange={(e) => setForm({ ...form, zoom_link: e.target.value })}
              />

              <div className="flex items-center gap-3">
                <Switch
                  id="is_virtual"
                  checked={form.is_virtual}
                  onCheckedChange={(checked) => setForm({ ...form, is_virtual: checked })}
                />
                <Label htmlFor="is_virtual">Virtual Event</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="show_on_homepage"
                  checked={form.show_on_homepage}
                  onCheckedChange={(checked) => setForm({ ...form, show_on_homepage: checked })}
                />
                <Label htmlFor="show_on_homepage">Show on Homepage</Label>
              </div>

              {editingId && (
                <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Archive Content (for past events)
                  </h4>
                  <FloatingInput
                    id="recording_url"
                    label="Recording URL"
                    value={form.recording_url}
                    onChange={(e) => setForm({ ...form, recording_url: e.target.value })}
                  />
                  <FloatingTextarea
                    id="notes"
                    label="Event Notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading events...</div>
      ) : events?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event to get started</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Zoom</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => {
                const eventPast = isPast(new Date(event.event_date));
                const hasSession = !!(event as any).community_session_id;
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{event.title}</span>
                        {event.host_name && (
                          <span className="block text-xs text-muted-foreground">
                            {event.host_name}{(event as any).host_designation ? ` · ${(event as any).host_designation}` : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.event_types?.name ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {event.event_types.name}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm">{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        <span className="block text-xs text-muted-foreground">{format(new Date(event.event_date), 'h:mm a')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs ${event.is_virtual ? 'text-primary' : ''}`}>
                        {event.is_virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {event.is_virtual ? 'Virtual' : event.location || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(event as any).zoom_link ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600">Set</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2"
                        onClick={() => setRegistrationsModal({ eventId: event.id, eventTitle: event.title })}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {registrationCounts[event.id] || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Send Reminder */}
                        {!eventPast && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Send reminder notification"
                            onClick={() => sendReminderMutation.mutate(event)}
                            disabled={sendReminderMutation.isPending}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Convert to Community Session */}
                        {eventPast && !hasSession && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Convert to Community Session"
                            onClick={() => setConvertDialog(event)}
                          >
                            <ArrowRightLeft className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {eventPast && hasSession && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">Session</span>
                        )}

                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(event.id); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Convert to Community Session Dialog */}
      <Dialog open={!!convertDialog} onOpenChange={(open) => { if (!open) { setConvertDialog(null); setConvertVideoUrl(''); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Community Session</DialogTitle>
            <DialogDescription>
              This will create a community session from "{convertDialog?.title}" with the event poster and host info pre-filled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
              <p><strong>Title:</strong> {convertDialog?.title}</p>
              <p><strong>Host:</strong> {convertDialog?.host_name || 'Forge Team'}{convertDialog?.host_designation ? ` · ${convertDialog.host_designation}` : ''}</p>
              <p><strong>Poster:</strong> {convertDialog?.image_url ? '✅ Set' : '❌ None'}</p>
            </div>
            <FloatingInput
              id="convert_video_url"
              label="Recording / Video URL *"
              value={convertVideoUrl}
              onChange={(e) => setConvertVideoUrl(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setConvertDialog(null); setConvertVideoUrl(''); }}>Cancel</Button>
              <Button
                onClick={() => convertMutation.mutate({ event: convertDialog, videoUrl: convertVideoUrl })}
                disabled={!convertVideoUrl || convertMutation.isPending}
              >
                {convertMutation.isPending ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EventRegistrationsModal
        eventId={registrationsModal?.eventId || null}
        eventTitle={registrationsModal?.eventTitle || ''}
        onClose={() => setRegistrationsModal(null)}
      />
    </div>
  );
};

export default AdminEvents;
