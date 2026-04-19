import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Video, Upload, Link, PlayCircle, Clock, CalendarDays, Image, Trash2 } from 'lucide-react';
import { FileUpload } from '@/components/admin/FileUpload';

interface RoadmapSession {
  id: string;
  title: string;
  day_number: number;
  date: string | null;
  session_start_time: string | null;
  session_duration_hours: number | null;
  description: string | null;
  cohort_type: string | null;
  meeting_url: string | null;
  meeting_id: string | null;
  meeting_passcode: string | null;
}

interface LiveSession {
  id: string;
  title: string;
  edition_id: string | null;
  start_at: string;
  end_at: string;
  zoom_meeting_number: string;
  zoom_passcode: string | null;
  thumbnail_url: string | null;
  recording_status: string;
  recording_url: string | null;
  learn_content_id: string | null;
}

const emptyRecordingForm = {
  recording_url: '',
  recording_status: 'ready',
  recordingSourceType: 'embed' as 'embed' | 'upload',
  thumbnail_url: '',
  thumbnailSourceType: 'upload' as 'upload' | 'url',
};

const AdminLiveSessions: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedEditionId, setSelectedEditionId] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRoadmapSession, setSelectedRoadmapSession] = useState<RoadmapSession | null>(null);
  const [existingLiveSessionId, setExistingLiveSessionId] = useState<string | null>(null);
  const [recordingForm, setRecordingForm] = useState(emptyRecordingForm);

  // Fetch editions
  const { data: editions = [] } = useQuery({
    queryKey: ['editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Roadmap online sessions for selected edition
  const { data: roadmapSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-roadmap-sessions-page', selectedEditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('id, title, day_number, date, session_start_time, session_duration_hours, description, cohort_type, meeting_url, meeting_id, meeting_passcode')
        .eq('edition_id', selectedEditionId)
        .lt('day_number', 0)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return (data || []) as RoadmapSession[];
    },
    enabled: !!selectedEditionId,
  });

  // Existing live_sessions for this edition (to show recording status)
  const { data: liveSessions = [] } = useQuery({
    queryKey: ['admin-live-sessions-edition', selectedEditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('id, title, edition_id, start_at, end_at, zoom_meeting_number, zoom_passcode, thumbnail_url, recording_status, recording_url, learn_content_id')
        .eq('edition_id', selectedEditionId)
        .order('start_at', { ascending: true });
      if (error) throw error;
      return (data || []) as LiveSession[];
    },
    enabled: !!selectedEditionId,
  });

  // Map YYYY-MM-DD → live_session for quick lookup
  const liveSessionByDate = useMemo(() => {
    const map: Record<string, LiveSession> = {};
    for (const ls of liveSessions) {
      const dateKey = ls.start_at.split('T')[0];
      map[dateKey] = ls;
    }
    return map;
  }, [liveSessions]);

  // ALL recordings across every edition — used for the "manage/cleanup" list
  // at the bottom of the page so admins can delete orphaned or stale recordings
  // that students are seeing on the Learn tab.
  const { data: allRecordings = [] } = useQuery({
    queryKey: ['admin-all-recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('id, title, thumbnail_url, recording_url, recording_status, learn_content_id, start_at, edition_id')
        .not('recording_url', 'is', null)
        .order('start_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const editionNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const e of editions) m[e.id] = e.name;
    return m;
  }, [editions]);

  const deleteRecordingMutation = useMutation({
    mutationFn: async ({ liveSessionId, learnContentId }: { liveSessionId: string; learnContentId: string | null }) => {
      // Delete learn_content first (otherwise the live_session FK dangles after delete).
      if (learnContentId) {
        const { error: lcErr } = await supabase.from('learn_content').delete().eq('id', learnContentId);
        if (lcErr) throw lcErr;
      }
      const { error } = await supabase.from('live_sessions').delete().eq('id', liveSessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-recordings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-live-sessions-edition', selectedEditionId] });
      queryClient.invalidateQueries({ queryKey: ['online-session-recordings'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-session-recordings'] });
      toast({ title: 'Recording deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Could not delete recording', description: err.message, variant: 'destructive' });
    },
  });

  const selectedEdition = editions.find(e => e.id === selectedEditionId);

  const openUploadDialog = (session: RoadmapSession) => {
    setSelectedRoadmapSession(session);
    const existingLs = session.date ? liveSessionByDate[session.date] : null;
    setExistingLiveSessionId(existingLs?.id ?? null);
    setRecordingForm({
      recording_url: existingLs?.recording_url || '',
      recording_status: existingLs?.recording_status === 'processing' ? 'processing' : 'ready',
      recordingSourceType: existingLs?.recording_url?.startsWith('http') !== false ? 'embed' : 'upload',
      thumbnail_url: existingLs?.thumbnail_url || '',
      thumbnailSourceType: 'upload',
    });
    setUploadDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoadmapSession) throw new Error('No session selected');
      const rs = selectedRoadmapSession;

      // Build datetimes from roadmap session data
      const baseDate = rs.date || new Date().toISOString().split('T')[0];
      const timePart = rs.session_start_time || '00:00';
      const startDT = new Date(`${baseDate}T${timePart}`).toISOString();
      const durationH = rs.session_duration_hours || 2;
      const endDT = new Date(new Date(startDT).getTime() + durationH * 3600000).toISOString();

      const record: any = {
        title: rs.title,
        description: rs.description || null,
        edition_id: selectedEditionId,
        cohort_type: selectedEdition?.cohort_type || 'FORGE',
        start_at: startDT,
        end_at: endDT,
        zoom_meeting_number: rs.meeting_id?.replace(/\D/g, '') || '0',
        zoom_passcode: rs.meeting_passcode || null,
        zoom_host_email: null,
        mentor_name: null,
        thumbnail_url: recordingForm.thumbnail_url || null,
        status: 'ended',
        recording_status: recordingForm.recording_status,
        recording_url: recordingForm.recording_url || null,
      };

      // Auto-create / update learn_content when marked ready
      if (record.recording_status === 'ready' && record.recording_url) {
        const isEmbed = record.recording_url.startsWith('http') || record.recording_url.includes('vimeo');
        const contentPayload = {
          title: record.title,
          video_url: record.recording_url,
          video_source_type: isEmbed ? 'embed' : 'upload',
          thumbnail_url: record.thumbnail_url || null,
          section_type: 'community_sessions',
          category: 'Session Recording',
          is_premium: false,
          order_index: 0,
        };

        const existingContentId = existingLiveSessionId
          ? liveSessions.find(s => s.id === existingLiveSessionId)?.learn_content_id
          : null;

        if (existingContentId) {
          const { error: contentErr } = await supabase
            .from('learn_content').update(contentPayload).eq('id', existingContentId);
          if (contentErr) throw contentErr;
          record.learn_content_id = existingContentId;
        } else {
          const { data: newContent, error: contentErr } = await supabase
            .from('learn_content').insert(contentPayload).select('id').single();
          if (contentErr) throw contentErr;
          record.learn_content_id = newContent.id;
        }
      }

      if (existingLiveSessionId) {
        const { error } = await supabase.from('live_sessions').update(record).eq('id', existingLiveSessionId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('live_sessions').insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-sessions-edition', selectedEditionId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-session-recordings'] });
      queryClient.invalidateQueries({ queryKey: ['online-session-recordings'] });
      setUploadDialogOpen(false);
      setSelectedRoadmapSession(null);
      setExistingLiveSessionId(null);
      setRecordingForm(emptyRecordingForm);
      toast({ title: 'Recording saved successfully' });
    },
    onError: (err: any) => {
      toast({ title: 'Error saving recording', description: err.message, variant: 'destructive' });
    },
  });

  const updateField = (key: string, value: string) =>
    setRecordingForm(prev => ({ ...prev, [key]: value }));

  const sessionIndex = selectedRoadmapSession
    ? roadmapSessions.indexOf(selectedRoadmapSession)
    : -1;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" /> Live Sessions & Recordings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select an edition to view its online sessions and upload recordings.
        </p>
      </div>

      {/* Edition selector */}
      <div className="max-w-sm">
        <Label className="mb-2 block">Select Edition</Label>
        <Select value={selectedEditionId} onValueChange={setSelectedEditionId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an edition..." />
          </SelectTrigger>
          <SelectContent>
            {editions.map(ed => (
              <SelectItem key={ed.id} value={ed.id}>{ed.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Online sessions list */}
      {selectedEditionId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Online Sessions
              {roadmapSessions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {roadmapSessions.length} session{roadmapSessions.length !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
          </div>

          {sessionsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-10">Loading sessions…</p>
          ) : roadmapSessions.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card/40 p-8 text-center space-y-1">
              <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No online sessions found</p>
              <p className="text-xs text-muted-foreground">
                Set up sessions first in Admin → Roadmap → Online Sessions (per Edition).
              </p>
            </div>
          ) : (
            roadmapSessions.map((session, index) => {
              const existingLs = session.date ? liveSessionByDate[session.date] : null;
              const recStatus = existingLs?.recording_status;
              const hasRecording = recStatus === 'ready';
              const isProcessing = recStatus === 'processing';

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/40 gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Session number badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{session.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {session.date ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.date}
                            {session.session_start_time ? ` · ${session.session_start_time}` : ''}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">Date TBA</span>
                        )}
                        {session.session_duration_hours && (
                          <span>{session.session_duration_hours}h</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasRecording && (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                        <PlayCircle className="w-3 h-3" /> Ready
                      </Badge>
                    )}
                    {isProcessing && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        Processing
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={hasRecording || isProcessing ? 'outline' : 'default'}
                      className="gap-1.5 whitespace-nowrap"
                      onClick={() => openUploadDialog(session)}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {hasRecording || isProcessing ? 'Edit Recording' : 'Upload Recording'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* All Session Recordings — management list for cleanup across editions */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            All Session Recordings
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {allRecordings.length} recording{allRecordings.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every recording currently visible to students in the Learn tab. Use this to delete stale or orphaned recordings.
          </p>
        </div>

        {allRecordings.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">No recordings uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allRecordings.map(rec => {
              const editionName = rec.edition_id ? (editionNameById[rec.edition_id] || 'Unknown edition') : 'No edition';
              const dateStr = rec.start_at ? rec.start_at.split('T')[0] : '—';
              const isDeleting = deleteRecordingMutation.isPending && deleteRecordingMutation.variables?.liveSessionId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-card/40"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {rec.thumbnail_url ? (
                      <img src={rec.thumbnail_url} alt={rec.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{rec.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      <span>{editionName}</span>
                      <span>·</span>
                      <span>{dateStr}</span>
                      {rec.recording_status === 'ready' ? (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                          {rec.recording_status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    disabled={isDeleting}
                    onClick={() => {
                      if (!confirm(`Delete recording "${rec.title}"? This cannot be undone.`)) return;
                      deleteRecordingMutation.mutate({ liveSessionId: rec.id, learnContentId: rec.learn_content_id });
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Recording Dialog — only asks for the video, nothing else */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              {existingLiveSessionId ? 'Edit Recording' : 'Upload Recording'}
            </DialogTitle>
            {selectedRoadmapSession && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Session {sessionIndex + 1}: {selectedRoadmapSession.title}
                {selectedRoadmapSession.date ? ` · ${selectedRoadmapSession.date}` : ''}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Source toggle */}
            <div className="space-y-2">
              <Label>Recording Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={recordingForm.recordingSourceType === 'embed' ? 'default' : 'outline'}
                  className="gap-1.5 flex-1"
                  onClick={() => updateField('recordingSourceType', 'embed')}
                >
                  <Link className="w-3.5 h-3.5" /> Vimeo / Embed Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={recordingForm.recordingSourceType === 'upload' ? 'default' : 'outline'}
                  className="gap-1.5 flex-1"
                  onClick={() => updateField('recordingSourceType', 'upload')}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload from Device
                </Button>
              </div>
            </div>

            {recordingForm.recordingSourceType === 'embed' ? (
              <div className="space-y-1">
                <Label>Vimeo / Embed URL</Label>
                <Input
                  value={recordingForm.recording_url}
                  onChange={e => updateField('recording_url', e.target.value)}
                  placeholder="https://vimeo.com/123456789"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Paste the Vimeo link or any embeddable video URL</p>
              </div>
            ) : (
              <FileUpload
                bucket="learn-videos"
                label="Upload Recording"
                helperText="MP4 recommended · max 5 GB"
                accept="video/*"
                maxSizeMB={5120}
                currentUrl={recordingForm.recording_url}
                onUploadComplete={url => updateField('recording_url', url)}
              />
            )}

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>
                Thumbnail Image{' '}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={recordingForm.thumbnailSourceType === 'upload' ? 'default' : 'outline'}
                  className="gap-1.5 flex-1"
                  onClick={() => updateField('thumbnailSourceType', 'upload')}
                >
                  <Image className="w-3.5 h-3.5" /> Upload Image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={recordingForm.thumbnailSourceType === 'url' ? 'default' : 'outline'}
                  className="gap-1.5 flex-1"
                  onClick={() => updateField('thumbnailSourceType', 'url')}
                >
                  <Link className="w-3.5 h-3.5" /> Paste URL
                </Button>
              </div>
              {recordingForm.thumbnailSourceType === 'upload' ? (
                <FileUpload
                  bucket="learn-thumbnails"
                  label="Upload Thumbnail"
                  helperText="JPG, PNG, or WebP · shown as card image in Learn tab"
                  accept="image/*"
                  maxSizeMB={10}
                  currentUrl={recordingForm.thumbnail_url}
                  onUploadComplete={url => updateField('thumbnail_url', url)}
                />
              ) : (
                <div className="space-y-1">
                  <Input
                    value={recordingForm.thumbnail_url}
                    onChange={e => updateField('thumbnail_url', e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">Shown as the card image in Learn tab</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label>Recording Status</Label>
              <Select
                value={recordingForm.recording_status}
                onValueChange={v => updateField('recording_status', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing — not visible to students yet</SelectItem>
                  <SelectItem value="ready">Ready — visible to students now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
              Once marked <strong className="text-foreground">Ready</strong>, the recording automatically
              appears in students' <strong className="text-foreground">Roadmap</strong> (View Session Recording button)
              and on the <strong className="text-foreground">Learn tab</strong> under "Online Session Recordings".
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !recordingForm.recording_url.trim()}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save Recording'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLiveSessions;
