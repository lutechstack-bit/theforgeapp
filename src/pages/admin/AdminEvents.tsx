import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar, MapPin, Video, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
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
};

const AdminEvents: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [registrationsModal, setRegistrationsModal] = useState<{ eventId: string; eventTitle: string } | null>(null);

  // Fetch event types
  const { data: eventTypes = [] } = useQuery({
    queryKey: ['admin-event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_types (
            id,
            name
          )
        `)
        .order('event_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch registration counts per event
  const { data: registrationCounts = {} } = useQuery({
    queryKey: ['event-registration-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id');
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((r) => {
        counts[r.event_id] = (counts[r.event_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      if (editingId) {
        const { error } = await supabase
          .from('events')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(editingId ? 'Event updated' : 'Event created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save event: ' + error.message);
    },
  });

  // Delete mutation
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

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: NonNullable<typeof events>[0]) => {
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date, // Keep as ISO string
      location: event.location || '',
      image_url: event.image_url || '',
      is_virtual: event.is_virtual,
      event_type_id: event.event_type_id || null,
      recording_url: event.recording_url || '',
      notes: event.notes || '',
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

    saveMutation.mutate(form);
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
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event title"
                  required
                />
              </div>

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
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Date & Time</Label>
                <DateTimePicker
                  value={form.event_date}
                  onChange={(isoString) => setForm({ ...form, event_date: isoString })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City or venue"
                />
              </div>

              <div>
                <Label>Event Image</Label>
                <FileUpload
                  bucket="event-images"
                  accept="image/*"
                  maxSizeMB={10}
                  label=""
                  helperText="Upload event banner (recommended: 16:9 ratio)"
                  currentUrl={form.image_url}
                  onUploadComplete={(url) => setForm({ ...form, image_url: url })}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_virtual"
                  checked={form.is_virtual}
                  onCheckedChange={(checked) => setForm({ ...form, is_virtual: checked })}
                />
                <Label htmlFor="is_virtual">Virtual Event</Label>
              </div>

              {/* Archive Fields - Only show for past events or when editing */}
              {editingId && (
                <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Archive Content (for past events)
                  </h4>
                  
                  <div>
                    <Label htmlFor="recording_url">Recording URL</Label>
                    <Input
                      id="recording_url"
                      value={form.recording_url}
                      onChange={(e) => setForm({ ...form, recording_url: e.target.value })}
                      placeholder="YouTube or Vimeo URL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Event Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Summary, key takeaways, or notes from the event..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
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
                <TableHead>Format</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Archive</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {event.event_types?.name ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {event.event_types.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{event.location || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      event.is_virtual
                        ? 'bg-secondary text-foreground'
                        : 'bg-accent/10 text-accent-foreground'
                    }`}>
                      {event.is_virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {event.is_virtual ? 'Virtual' : 'In-Person'}
                    </span>
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
                    <div className="flex gap-1">
                      {event.recording_url && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-600">Video</span>
                      )}
                      {event.notes && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600">Notes</span>
                      )}
                      {!event.recording_url && !event.notes && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this event?')) {
                            deleteMutation.mutate(event.id);
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

      {/* Registrations Modal */}
      <EventRegistrationsModal
        eventId={registrationsModal?.eventId || null}
        eventTitle={registrationsModal?.eventTitle || ''}
        onClose={() => setRegistrationsModal(null)}
      />
    </div>
  );
};

export default AdminEvents;
