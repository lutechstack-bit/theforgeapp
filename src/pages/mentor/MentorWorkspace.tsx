import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Instagram, Twitter, MapPin, Mail, Lock, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { useMyMentorStudents, type MentorAssignmentRow } from '@/hooks/useMentorAssignments';
import { useStudentDetail } from '@/hooks/useStudentDetail';
import { useMentorNotes, useAddMentorNote, useDeleteMentorNote } from '@/hooks/useMentorNotes';
import { useAuth } from '@/contexts/AuthContext';
import { MentorDoubtsTab } from '@/components/mentor/MentorDoubtsTab';
import { MentorSubmissionsTab } from '@/components/mentor/MentorSubmissionsTab';
import { SendMentorCardDialog } from '@/components/mentor/SendMentorCardDialog';
import { SentCardsLog } from '@/components/mentor/SentCardsLog';

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatRelative = (iso: string): string => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ────────────────────────────────────────────────────────────────────────
// Student rail — left side, always visible
// ────────────────────────────────────────────────────────────────────────
type Assignment = MentorAssignmentRow;

const StudentRail: React.FC<{
  assignments: Assignment[];
  loading: boolean;
  activeId: string | null;
  onPick: (studentId: string) => void;
}> = ({ assignments, loading, activeId, onPick }) => {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          My students
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {loading
            ? 'Loading…'
            : `${assignments.length} assigned`}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {loading && (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          )}
          {!loading && assignments.length === 0 && (
            <div className="m-2 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
              No students assigned yet. An admin will assign students to you from the Mentor
              Assignments page.
            </div>
          )}
          {assignments.map((a) => {
            const studentId = a.student_user_id;
            const prof = a.profiles;
            const isActive = activeId === studentId;
            return (
              <button
                key={a.id}
                onClick={() => onPick(studentId)}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-primary/10 border-l-2 border-primary pl-[10px]'
                    : 'hover:bg-muted/50',
                ].join(' ')}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={prof?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-xs font-semibold text-primary">
                    {initials(prof?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {prof?.full_name ?? 'Unnamed'}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    Assigned {formatRelative(a.assigned_at)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Student detail pane
// ────────────────────────────────────────────────────────────────────────
const StudentDetailPane: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { data: student, isLoading } = useStudentDetail(studentId);
  const { user } = useAuth();
  const [sendOpen, setSendOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="mt-4 h-80 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-1 p-8 text-sm text-muted-foreground">
        Couldn't load this student's profile.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-border p-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-lg font-bold text-primary">
              {initials(student.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight">{student.full_name ?? 'Unnamed'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {student.specialty && <span>{student.specialty}</span>}
              {student.city && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {student.city}
                  </span>
                </>
              )}
              {student.edition?.name && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span>{student.edition.name} · {student.edition.city}</span>
                </>
              )}
            </div>
            {student.tagline && (
              <p className="mt-2 font-serif text-sm italic text-foreground/80">
                "{student.tagline}"
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSendOpen(true)}
            >
              Send notification / card
            </Button>
          </div>
        </div>
      </header>

      {/* Send-card dialog (per student) */}
      <SendMentorCardDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        studentUserId={student.id}
        studentFirstName={student.full_name?.split(' ')[0] ?? 'student'}
        mentorName={(user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name ?? 'You'}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="shrink-0 justify-start rounded-none border-b border-border bg-background px-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="doubts">Doubts</TabsTrigger>
          <TabsTrigger value="notes">Private notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 overflow-y-auto p-6">
          <OverviewTab student={student} />
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 overflow-y-auto p-6">
          <MentorSubmissionsTab
            studentId={student.id}
            studentFirstName={student.full_name?.split(' ')[0] ?? 'this student'}
          />
        </TabsContent>

        <TabsContent value="doubts" className="flex-1 overflow-y-auto p-6">
          <MentorDoubtsTab
            studentId={student.id}
            studentFirstName={student.full_name?.split(' ')[0] ?? 'this student'}
          />
        </TabsContent>

        <TabsContent value="notes" className="flex-1 overflow-y-auto p-6">
          <NotesTab studentId={student.id} studentFirstName={student.full_name?.split(' ')[0] ?? 'this student'} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Tabs
// ────────────────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ student: NonNullable<ReturnType<typeof useStudentDetail>['data']> }> = ({ student }) => (
  <div className="grid max-w-4xl gap-4 md:grid-cols-2">
    <Card className="p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Profile basics
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        {student.specialty && (
          <Row label="Specialty" value={student.specialty} />
        )}
        {student.email && (
          <Row label="Email" value={<a href={`mailto:${student.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline"><Mail className="h-3 w-3" />{student.email}</a>} />
        )}
        {student.city && <Row label="Location" value={student.city} />}
        {student.instagram_handle && (
          <Row label="Instagram" value={<a href={`https://instagram.com/${student.instagram_handle}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><Instagram className="h-3 w-3" />@{student.instagram_handle}</a>} />
        )}
        {student.twitter_handle && (
          <Row label="Twitter" value={<a href={`https://twitter.com/${student.twitter_handle}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><Twitter className="h-3 w-3" />@{student.twitter_handle}</a>} />
        )}
      </dl>
    </Card>

    <Card className="p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Edition
      </div>
      {student.edition ? (
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Cohort" value={student.edition.name} />
          <Row label="City" value={student.edition.city} />
          <Row label="Cohort type" value={student.edition.cohort_type} />
          {student.edition.forge_start_date && (
            <Row
              label="Forge window"
              value={`${new Date(student.edition.forge_start_date).toLocaleDateString()} — ${
                student.edition.forge_end_date
                  ? new Date(student.edition.forge_end_date).toLocaleDateString()
                  : 'TBD'
              }`}
            />
          )}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No edition assigned.</p>
      )}
    </Card>

    <div className="md:col-span-2">
      <SentCardsLog
        studentId={student.id}
        studentFirstName={student.full_name?.split(' ')[0] ?? 'this student'}
      />
    </div>

    {student.bio && (
      <Card className="p-5 md:col-span-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bio
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {student.bio}
        </p>
      </Card>
    )}
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-baseline gap-3">
    <dt className="w-24 shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
    </dt>
    <dd className="min-w-0 flex-1 break-words">{value}</dd>
  </div>
);

const StubTab: React.FC<{ title: string; description: string; badge: string }> = ({
  title,
  description,
  badge,
}) => (
  <Card className="max-w-2xl p-8 text-center">
    <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      {badge}
    </div>
    <h3 className="mt-3 text-base font-semibold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
  </Card>
);

// ────────────────────────────────────────────────────────────────────────
// Private notes tab (fully functional)
// ────────────────────────────────────────────────────────────────────────
const NotesTab: React.FC<{ studentId: string; studentFirstName: string }> = ({
  studentId,
  studentFirstName,
}) => {
  const [draft, setDraft] = useState('');
  const { user } = useAuth();
  const { data: notes = [], isLoading } = useMentorNotes(studentId);
  const add = useAddMentorNote();
  const del = useDeleteMentorNote();

  const canSubmit = draft.trim().length > 0 && draft.length <= 2000;

  const onSave = async () => {
    try {
      await add.mutateAsync({ studentId, body: draft });
      setDraft('');
      toast.success('Note saved');
    } catch (e) {
      toast.error(`Could not save note: ${String(e)}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>
          Private to mentors and admins. {studentFirstName} cannot see these notes.
        </span>
      </div>

      <Card className="p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
          placeholder={`Write a private note about ${studentFirstName}…`}
          rows={3}
          className="resize-none"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={
              draft.length >= 1900
                ? 'text-destructive'
                : draft.length >= 1700
                ? 'text-orange-500'
                : ''
            }
          >
            {draft.length} / 2000
          </span>
          <div className="flex gap-2">
            {draft.trim() && (
              <Button variant="ghost" size="sm" onClick={() => setDraft('')}>
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={onSave} disabled={!canSubmit || add.isPending}>
              {add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save note'}
            </Button>
          </div>
        </div>
      </Card>

      <Separator className="my-5" />

      <div className="space-y-3">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {!isLoading && notes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No notes yet. The first one goes above.
          </p>
        )}
        {notes.map((n) => {
          const mine = n.mentor_user_id === user?.id;
          return (
            <Card key={n.id} className="p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{n.body}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {n.author?.full_name ?? 'Mentor'} · {formatRelative(n.created_at)}
                </span>
                {mine && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      try {
                        await del.mutateAsync({ noteId: n.id, studentId });
                        toast.success('Note deleted');
                      } catch (e) {
                        toast.error(`Could not delete: ${String(e)}`);
                      }
                    }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main workspace — rail + detail
// ────────────────────────────────────────────────────────────────────────
const MentorWorkspace: React.FC = () => {
  const { studentId: routeStudentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();
  const { data: assignments = [], isLoading } = useMyMentorStudents();

  // Auto-select the first student if none in URL.
  const activeStudentId = useMemo(() => {
    if (routeStudentId) return routeStudentId;
    return assignments[0]?.student_user_id ?? null;
  }, [routeStudentId, assignments]);

  const onPickStudent = (id: string) => {
    navigate(`/mentor/students/${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <StudentRail
        assignments={assignments}
        loading={isLoading}
        activeId={activeStudentId}
        onPick={onPickStudent}
      />
      {activeStudentId ? (
        <StudentDetailPane key={activeStudentId} studentId={activeStudentId} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          {isLoading
            ? 'Loading…'
            : 'Pick a student from the rail to get started.'}
        </div>
      )}
    </div>
  );
};

export default MentorWorkspace;
