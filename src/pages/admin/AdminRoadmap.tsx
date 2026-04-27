import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Loader2, Clock, MapPin, GripVertical, Video, Globe, Eye, EyeOff, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

type CohortType = 'FORGE' | 'FORGE_CREATORS' | 'FORGE_WRITING';

const COHORT_LABELS: Record<CohortType, string> = {
  FORGE: 'Filmmaking',
  FORGE_CREATORS: 'Creators',
  FORGE_WRITING: 'Writing',
};

export default function AdminRoadmap() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<RoadmapDay | null>(null);
  const [deletingDay, setDeletingDay] = useState<RoadmapDay | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortType>('FORGE');
  const queryClient = useQueryClient();

  // Fetch template days for the selected cohort
  const { data: roadmapDays, isLoading: daysLoading } = useQuery({
    queryKey: ['admin-roadmap-days-template', selectedCohort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .is('edition_id', null)
        .eq('is_template', true)
        .eq('cohort_type', selectedCohort)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return data as RoadmapDay[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<RoadmapDay, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('roadmap_days').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days-template'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RoadmapDay> & { id: string }) => {
      const { error } = await supabase.from('roadmap_days').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days-template'] });
      setEditingDay(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roadmap_days').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Day deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-roadmap-days-template'] });
      setDeletingDay(null);
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Roadmap Management</h1>
      <p className="text-muted-foreground mb-6">Manage roadmap templates and edition-specific online session schedules.</p>

      <Tabs defaultValue="template">
        <TabsList className="mb-6">
          <TabsTrigger value="template">Template Days</TabsTrigger>
          <TabsTrigger value="online-sessions">Online Sessions (per Edition)</TabsTrigger>
        </TabsList>

        <TabsContent value="online-sessions">
          <EditionOnlineSessions />
        </TabsContent>

        <TabsContent value="template">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Roadmap Templates</h2>
          <p className="text-muted-foreground mt-1">Content used for new editions. Bootcamp dates auto-calculate from the edition's start date.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Day
        </Button>
      </div>

      {/* Cohort selector */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(COHORT_LABELS) as CohortType[]).map(cohort => (
          <button
            key={cohort}
            onClick={() => setSelectedCohort(cohort)}
            className={cn(
              'px-4 py-2 rounded-full text-sm border transition-all duration-200',
              selectedCohort === cohort
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
            )}
          >
            {COHORT_LABELS[cohort]}
          </button>
        ))}
      </div>

      {/* Roadmap Days List */}
      {daysLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : roadmapDays?.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            No template days for <span className="text-foreground font-medium">{COHORT_LABELS[selectedCohort]}</span> yet. Click "Add Day" to create the first one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(() => {
            const totalOnline = roadmapDays?.filter(d => d.day_number < 0).length ?? 0;
            return roadmapDays?.map((day) => {
              const dayLabel =
                day.day_number < 0
                  ? `S${totalOnline + day.day_number + 1}`
                  : day.day_number === 0
                  ? 'Pre'
                  : `Day ${day.day_number}`;
              return (
            <Card key={day.id} className="bg-card/50 border-border/50">
              <CardContent className="py-4 px-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="font-bold text-primary w-12">
                      {dayLabel}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{day.title}</h3>
                      {day.cohort_type && (
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
                          {day.cohort_type}
                        </Badge>
                      )}
                      {day.is_virtual && (
                        <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10 text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {day.call_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {day.call_time}
                        </span>
                      )}
                      {day.location && !day.is_virtual && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {day.location}
                        </span>
                      )}
                      {day.is_virtual && day.meeting_url && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Video className="w-3 h-3" />
                          Zoom configured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${day.is_active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {day.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setEditingDay(day)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingDay(day)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
              );
            });
          })()}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <RoadmapDayDialog
        open={isDialogOpen || !!editingDay}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingDay(null);
          }
        }}
        day={editingDay}
        defaultCohortType={selectedCohort}
        onSubmit={(data) => {
          if (editingDay) {
            updateMutation.mutate({ id: editingDay.id, ...data });
          } else {
            createMutation.mutate(data as any);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDay} onOpenChange={() => setDeletingDay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Day?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingDay?.title}" from the roadmap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDay && deleteMutation.mutate(deletingDay.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Edition Online Sessions Manager ──────────────────────────────
function EditionOnlineSessions() {
  const [selectedEditionId, setSelectedEditionId] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all active editions
  const { data: editions } = useQuery({
    queryKey: ['admin-editions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, city, cohort_type, forge_start_date, online_start_date')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch online sessions for selected edition
  const { data: onlineSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-online-sessions', selectedEditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .eq('edition_id', selectedEditionId)
        .lt('day_number', 0)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return data as RoadmapDay[];
    },
    enabled: !!selectedEditionId,
  });

  // Update a single session
  const updateSession = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RoadmapDay> & { id: string }) => {
      const { error } = await supabase.from('roadmap_days').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Session updated');
      queryClient.invalidateQueries({ queryKey: ['admin-online-sessions', selectedEditionId] });
      setSavingId(null);
    },
    onError: (error: Error) => { toast.error(error.message); setSavingId(null); }
  });

  const selectedEdition = editions?.find(e => e.id === selectedEditionId);

  const handleSeedSessions = async () => {
    if (!selectedEditionId || !selectedEdition) return;
    setSeeding(true);
    try {
      // 1. Fetch template online sessions for this cohort type
      const { data: templates, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .lt('day_number', 0)
        .eq('cohort_type', selectedEdition.cohort_type)
        .eq('is_template', true)
        .order('day_number', { ascending: true });

      if (error) throw error;
      if (!templates || templates.length === 0) {
        toast.error(`No template online sessions found for cohort type "${selectedEdition.cohort_type}". Create template days first.`);
        return;
      }

      // 2. Create per-edition copies — blank date + zoom fields
      const { error: insertError } = await supabase
        .from('roadmap_days')
        .insert(
          templates.map(({ id: _id, created_at: _ca, updated_at: _ua, ...t }) => ({
            ...t,
            edition_id: selectedEditionId,
            date: null,
            meeting_url: null,
            meeting_id: null,
            meeting_passcode: null,
            session_start_time: null,
            is_template: false,
          }))
        );

      if (insertError) throw insertError;
      queryClient.invalidateQueries({ queryKey: ['admin-online-sessions', selectedEditionId] });
      toast.success(`Created ${templates.length} online session${templates.length > 1 ? 's' : ''} for this edition. Fill in dates and Zoom links below.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to seed sessions');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Online Session Scheduler</h2>
        <p className="text-muted-foreground text-sm">Set exact dates, times, and Zoom links for each online session per edition. These change based on mentor availability.</p>
      </div>

      {/* Edition selector */}
      <div className="max-w-md">
        <Label className="mb-2 block">Select Edition</Label>
        <Select value={selectedEditionId} onValueChange={setSelectedEditionId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an edition..." />
          </SelectTrigger>
          <SelectContent>
            {editions?.map(ed => (
              <SelectItem key={ed.id} value={ed.id}>
                {ed.name} — {ed.city} ({ed.cohort_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEditionId && selectedEdition && (
        <div className="text-xs text-muted-foreground flex gap-4">
          <span>Bootcamp: {selectedEdition.forge_start_date || 'Not set'}</span>
          <span>Online start: {selectedEdition.online_start_date || 'Not set'}</span>
        </div>
      )}

      {/* Sessions list */}
      {sessionsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedEditionId && !sessionsLoading && (!onlineSessions || onlineSessions.length === 0) && (
        <div className="rounded-xl border border-dashed border-border/40 p-8 text-center space-y-3">
          <p className="text-sm font-medium text-foreground">No online sessions set up for this edition yet</p>
          <p className="text-xs text-muted-foreground">
            This will copy the template online sessions for{' '}
            <span className="font-semibold text-primary">{selectedEdition?.cohort_type}</span>{' '}
            and create blank rows for this edition. You can then fill in dates and Zoom links below.
          </p>
          <Button onClick={handleSeedSessions} disabled={seeding} className="gap-2 mt-1">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {seeding ? 'Creating sessions…' : 'Set up online sessions from template'}
          </Button>
        </div>
      )}

      {onlineSessions && onlineSessions.length > 0 && (
        <div className="space-y-4">
          {onlineSessions.map((session, index) => (
            <OnlineSessionCard
              key={session.id}
              session={session}
              sessionNumber={index + 1}
              isSaving={savingId === session.id}
              onSave={(data) => {
                setSavingId(session.id);
                updateSession.mutate({ id: session.id, ...data });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single Online Session Card (inline edit) ─────────────────────
function OnlineSessionCard({
  session,
  sessionNumber,
  isSaving,
  onSave,
}: {
  session: RoadmapDay;
  sessionNumber: number;
  isSaving: boolean;
  onSave: (data: Partial<RoadmapDay>) => void;
}) {
  const [date, setDate] = useState(session.date || '');
  const [startTime, setStartTime] = useState(session.session_start_time || '');
  const [duration, setDuration] = useState(String(session.session_duration_hours || ''));
  const [meetingUrl, setMeetingUrl] = useState(session.meeting_url || '');
  const [meetingId, setMeetingId] = useState(session.meeting_id || '');
  const [passcode, setPasscode] = useState(session.meeting_passcode || '');

  const hasChanges =
    date !== (session.date || '') ||
    startTime !== (session.session_start_time || '') ||
    duration !== String(session.session_duration_hours || '') ||
    meetingUrl !== (session.meeting_url || '') ||
    meetingId !== (session.meeting_id || '') ||
    passcode !== (session.meeting_passcode || '');

  const handleSave = () => {
    onSave({
      date: date || null,
      session_start_time: startTime || null,
      session_duration_hours: duration ? parseFloat(duration) : null,
      meeting_url: meetingUrl || null,
      meeting_id: meetingId || null,
      meeting_passcode: passcode || null,
    });
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="py-4 px-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10">
              <Video className="w-3 h-3 mr-1" />
              Session {sessionNumber}
            </Badge>
            <h3 className="font-semibold text-foreground">{session.title}</h3>
          </div>
          <Button
            size="sm"
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className="gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>

        {session.description && (
          <p className="text-sm text-muted-foreground">{session.description}</p>
        )}

        {/* Date + Time row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration (hrs)</Label>
            <Input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Zoom row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 col-span-1">
            <Label className="text-xs">Zoom Link</Label>
            <Input
              placeholder="https://zoom.us/j/..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Meeting ID</Label>
            <Input
              placeholder="123 456 7890"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Passcode</Label>
            <Input
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs">
          {date ? (
            <span className="text-green-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {date} at {startTime || 'time TBA'}</span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date not yet set — users will see "TBA"</span>
          )}
          {meetingUrl ? (
            <span className="text-green-400 flex items-center gap-1 ml-3"><Video className="w-3 h-3" /> Zoom ready</span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1 ml-3"><Video className="w-3 h-3" /> No Zoom link</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RoadmapDayDialog({
  open,
  onOpenChange,
  day,
  defaultCohortType,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: RoadmapDay | null;
  defaultCohortType?: CohortType;
  onSubmit: (data: Partial<RoadmapDay>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    day_number: 0,
    title: '',
    description: '',
    call_time: '',
    location: '',
    is_active: false,
    checklist: [] as string[],
    cohort_type: '' as '' | 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS',
    // Virtual meeting fields
    is_virtual: false,
    meeting_url: '',
    meeting_id: '',
    meeting_passcode: '',
    session_start_time: '',
    session_duration_hours: 2,
  });
  const [checklistInput, setChecklistInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  React.useEffect(() => {
    if (day) {
      setFormData({
        day_number: day.day_number,
        title: day.title,
        description: day.description || '',
        call_time: day.call_time || '',
        location: day.location || '',
        is_active: day.is_active,
        checklist: (day.checklist as string[]) || [],
        cohort_type: (day.cohort_type as '' | 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS') || '',
        is_virtual: day.is_virtual || false,
        meeting_url: day.meeting_url || '',
        meeting_id: day.meeting_id || '',
        meeting_passcode: day.meeting_passcode || '',
        session_start_time: day.session_start_time || '',
        session_duration_hours: Number(day.session_duration_hours) || 2,
      });
    } else {
      setFormData({
        day_number: 0,
        title: '',
        description: '',
        call_time: '',
        location: '',
        is_active: false,
        checklist: [],
        cohort_type: defaultCohortType || '',
        is_virtual: false,
        meeting_url: '',
        meeting_id: '',
        meeting_passcode: '',
        session_start_time: '',
        session_duration_hours: 2,
      });
    }
  }, [day, open]);

  const addChecklistItem = () => {
    if (checklistInput.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, checklistInput.trim()]
      }));
      setChecklistInput('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cohort_type) {
      toast.error('Please select a cohort type for this template day.');
      return;
    }
    onSubmit({
      edition_id: null,        // Template days have no edition
      is_template: true,       // Required by useRoadmapData template query
      cohort_type: formData.cohort_type,
      day_number: formData.day_number,
      title: formData.title,
      description: formData.description || null,
      date: null,              // Dates are calculated dynamically (bootcamp) or set per-edition (online)
      call_time: formData.call_time || null,
      location: formData.location || null,
      is_active: formData.is_active,
      checklist: formData.checklist.length > 0 ? formData.checklist : null,
      is_virtual: formData.is_virtual,
      meeting_url: formData.is_virtual ? (formData.meeting_url || null) : null,
      meeting_id: formData.is_virtual ? (formData.meeting_id || null) : null,
      meeting_passcode: formData.is_virtual ? (formData.meeting_passcode || null) : null,
      session_start_time: formData.is_virtual ? (formData.session_start_time || null) : null,
      session_duration_hours: formData.is_virtual ? formData.session_duration_hours : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{day ? 'Edit Day' : 'Add Day'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cohort Type — required for template query to find this day */}
          <div className="space-y-2">
            <Label>Cohort Type *</Label>
            <Select
              value={formData.cohort_type}
              onValueChange={(v) => setFormData(prev => ({ ...prev, cohort_type: v as typeof formData.cohort_type }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select which cohort this template is for…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FORGE">FORGE — Filmmaking (8-day bootcamp)</SelectItem>
                <SelectItem value="FORGE_CREATORS">FORGE_CREATORS — Creators (7-day bootcamp)</SelectItem>
                <SelectItem value="FORGE_WRITING">FORGE_WRITING — Writing</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only shown to users in this cohort. Online sessions use negative day numbers (e.g. −6 to −1).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day Number *</Label>
              <Input
                type="number"
                required
                value={formData.day_number}
                onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Negative = online session · 0 = Pre-Forge · Positive = bootcamp day</p>
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-6">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              placeholder="e.g., Orientation & Foundations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What happens on this day..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Call Time</Label>
            <Input
              type="time"
              value={formData.call_time}
              onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Dates are calculated automatically from edition start date</p>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="e.g., Mumbai Hub"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={formData.is_virtual}
            />
            {formData.is_virtual && (
              <p className="text-xs text-muted-foreground">Location not needed for virtual sessions</p>
            )}
          </div>

          {/* Virtual Meeting Section */}
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                <Label className="text-blue-400 font-semibold">Virtual Session</Label>
              </div>
              <Switch
                checked={formData.is_virtual}
                onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
              />
            </div>

            {formData.is_virtual && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Meeting URL *</Label>
                  <Input
                    placeholder="https://zoom.us/j/123456789"
                    value={formData.meeting_url}
                    onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meeting ID</Label>
                    <Input
                      placeholder="123 456 7890"
                      value={formData.meeting_id}
                      onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passcode</Label>
                    <div className="relative">
                      <Input
                        type={showPasscode ? 'text' : 'password'}
                        placeholder="Enter passcode"
                        value={formData.meeting_passcode}
                        onChange={(e) => setFormData({ ...formData, meeting_passcode: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPasscode(!showPasscode)}
                      >
                        {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Start Time</Label>
                    <Input
                      type="time"
                      value={formData.session_start_time}
                      onChange={(e) => setFormData({ ...formData, session_start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <Input
                      type="number"
                      min={0.5}
                      max={12}
                      step={0.5}
                      value={formData.session_duration_hours}
                      onChange={(e) => setFormData({ ...formData, session_duration_hours: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Checklist Items</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add checklist item"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
              />
              <Button type="button" variant="secondary" onClick={addChecklistItem}>
                Add
              </Button>
            </div>
            {formData.checklist.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded">
                    <span className="flex-1">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {day ? 'Save Changes' : 'Add Day'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
