import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Video } from 'lucide-react';
import { format } from 'date-fns';

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  edition_id: string | null;
  cohort_type: string;
  start_at: string;
  end_at: string;
  zoom_meeting_number: string;
  zoom_passcode: string | null;
  zoom_host_email: string | null;
  mentor_name: string | null;
  thumbnail_url: string | null;
  status: string;
  recording_status: string;
  recording_url: string | null;
  learn_content_id: string | null;
  created_at: string;
}

const emptyForm = {
  title: '',
  description: '',
  edition_id: '',
  cohort_type: 'FORGE',
  start_at: '',
  end_at: '',
  zoom_meeting_number: '',
  zoom_passcode: '',
  zoom_host_email: '',
  mentor_name: '',
  thumbnail_url: '',
  status: 'scheduled',
  recording_status: 'none',
  recording_url: '',
  learn_content_id: '',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live: 'bg-red-500/20 text-red-400 border-red-500/30',
  ended: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const recStatusColors: Record<string, string> = {
  none: '',
  processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const AdminLiveSessions: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-live-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .order('start_at', { ascending: false });
      if (error) throw error;
      return data as LiveSession[];
    },
  });

  const { data: editions = [] } = useQuery({
    queryKey: ['editions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('editions').select('id, name, cohort_type').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: learnContent = [] } = useQuery({
    queryKey: ['admin-learn-content-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('learn_content').select('id, title').order('title');
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const record: any = {
        title: payload.title,
        description: payload.description || null,
        edition_id: payload.edition_id && payload.edition_id !== 'none' ? payload.edition_id : null,
        cohort_type: payload.cohort_type,
        start_at: payload.start_at,
        end_at: payload.end_at,
        zoom_meeting_number: payload.zoom_meeting_number,
        zoom_passcode: payload.zoom_passcode || null,
        zoom_host_email: payload.zoom_host_email || null,
        mentor_name: payload.mentor_name || null,
        thumbnail_url: payload.thumbnail_url || null,
        status: payload.status,
        recording_status: payload.recording_status,
        recording_url: payload.recording_url || null,
        learn_content_id: payload.learn_content_id && payload.learn_content_id !== 'none' ? payload.learn_content_id : null,
      };

      if (editingId) {
        const { error } = await supabase.from('live_sessions').update(record).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('live_sessions').insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-sessions'] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? 'Session updated' : 'Session created' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('live_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-sessions'] });
      toast({ title: 'Session deleted' });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: LiveSession) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description || '',
      edition_id: s.edition_id || '',
      cohort_type: s.cohort_type,
      start_at: s.start_at ? format(new Date(s.start_at), "yyyy-MM-dd'T'HH:mm") : '',
      end_at: s.end_at ? format(new Date(s.end_at), "yyyy-MM-dd'T'HH:mm") : '',
      zoom_meeting_number: s.zoom_meeting_number,
      zoom_passcode: s.zoom_passcode || '',
      zoom_host_email: s.zoom_host_email || '',
      mentor_name: s.mentor_name || '',
      thumbnail_url: s.thumbnail_url || '',
      status: s.status,
      recording_status: s.recording_status,
      recording_url: s.recording_url || '',
      learn_content_id: s.learn_content_id || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_at || !form.end_at || !form.zoom_meeting_number) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    saveMutation.mutate(form);
  };

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" /> Live Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{sessions.length} session(s)</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Session
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recording</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : sessions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No live sessions yet</TableCell></TableRow>
            ) : sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className="text-muted-foreground">{s.mentor_name || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(s.start_at), 'MMM d, h:mm a')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[s.status] || ''}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {s.recording_status !== 'none' && (
                    <Badge variant="outline" className={recStatusColors[s.recording_status] || ''}>
                      {s.recording_status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this session?')) deleteMutation.mutate(s.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Live Session' : 'New Live Session'}</DialogTitle>
            <DialogDescription>Fill in the details below to {editingId ? 'update the' : 'create a new'} live session.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => updateField('title', e.target.value)} required />
              </div>

              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} />
              </div>

              <div>
                <Label>Edition</Label>
                <Select value={form.edition_id} onValueChange={v => updateField('edition_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select edition" /></SelectTrigger>
                  <SelectContent>
                    {editions.map(ed => (
                      <SelectItem key={ed.id} value={ed.id}>{ed.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cohort Type</Label>
                <Select value={form.cohort_type} onValueChange={v => updateField('cohort_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORGE">FORGE</SelectItem>
                    <SelectItem value="FORGE_CREATORS">FORGE_CREATORS</SelectItem>
                    <SelectItem value="FORGE_WRITING">FORGE_WRITING</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start *</Label>
                <Input type="datetime-local" value={form.start_at} onChange={e => updateField('start_at', e.target.value)} required />
              </div>

              <div>
                <Label>End *</Label>
                <Input type="datetime-local" value={form.end_at} onChange={e => updateField('end_at', e.target.value)} required />
              </div>

              <div>
                <Label>Zoom Meeting Number *</Label>
                <Input value={form.zoom_meeting_number} onChange={e => updateField('zoom_meeting_number', e.target.value)} required />
              </div>

              <div>
                <Label>Zoom Passcode</Label>
                <Input value={form.zoom_passcode} onChange={e => updateField('zoom_passcode', e.target.value)} />
              </div>

              <div>
                <Label>Host Email</Label>
                <Input type="email" value={form.zoom_host_email} onChange={e => updateField('zoom_host_email', e.target.value)} />
              </div>

              <div>
                <Label>Mentor Name</Label>
                <Input value={form.mentor_name} onChange={e => updateField('mentor_name', e.target.value)} />
              </div>

              <div>
                <Label>Thumbnail URL</Label>
                <Input value={form.thumbnail_url} onChange={e => updateField('thumbnail_url', e.target.value)} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Recording Status</Label>
                <Select value={form.recording_status} onValueChange={v => updateField('recording_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label>Recording URL</Label>
                <Input value={form.recording_url} onChange={e => updateField('recording_url', e.target.value)} placeholder="Paste recording URL when ready" />
              </div>

              <div className="sm:col-span-2">
                <Label>Link to Learn Content</Label>
                <Select value={form.learn_content_id} onValueChange={v => updateField('learn_content_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Optional — link to Learn" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {learnContent.map(lc => (
                      <SelectItem key={lc.id} value={lc.id}>{lc.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLiveSessions;
