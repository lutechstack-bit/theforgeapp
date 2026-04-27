import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { GripVertical, Users, AlertCircle, Minus, Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import {
  useMentors,
  useStudentsInEdition,
  useAssignmentsForEdition,
  useAssignStudent,
  useUnassignStudent,
  useEditionsList,
  useMentorCandidates,
  useGrantMentorRole,
  useUpdateMentorCapacity,
  type MentorRow,
  type StudentRow,
  type AssignmentRow,
} from '@/hooks/useMentorAdminData';

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const POOL_ID = '__pool__';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// ────────────────────────────────────────────────────────────────────────
// Draggable student chip
// ────────────────────────────────────────────────────────────────────────
const StudentChip: React.FC<{ student: StudentRow; containerId: string }> = ({
  student,
  containerId,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `student:${student.id}`,
    data: { studentId: student.id, fromContainer: containerId },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        'group flex items-center gap-2 rounded-md border border-border/40 bg-card px-2.5 py-1.5',
        'text-sm cursor-grab active:cursor-grabbing select-none',
        isDragging ? 'opacity-40' : 'hover:border-primary/40',
      ].join(' ')}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 group-hover:text-muted-foreground" />
      <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-800/30 to-transparent text-[10px] font-semibold text-primary">
        {initials(student.full_name)}
      </div>
      <span className="truncate text-xs font-medium">
        {student.full_name ?? 'Unnamed'}
      </span>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Droppable container — used by each mentor card + the unassigned pool
// ────────────────────────────────────────────────────────────────────────
const DropContainer: React.FC<{
  id: string;
  canAccept: boolean;
  children: React.ReactNode;
}> = ({ id, canAccept, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id, data: { containerId: id } });
  return (
    <div
      ref={setNodeRef}
      className={[
        'min-h-[120px] rounded-md transition-colors',
        isOver && canAccept && 'bg-primary/5 ring-1 ring-primary/40',
        isOver && !canAccept && 'bg-destructive/5 ring-1 ring-destructive/40',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Mentor card — header + droppable student list
// ────────────────────────────────────────────────────────────────────────
const CAPACITY_MIN = 1;
const CAPACITY_MAX = 20;

const MentorCard: React.FC<{
  mentor: MentorRow;
  students: StudentRow[];
  overCapacity: boolean;
  incomingCount: number;
}> = ({ mentor, students, overCapacity, incomingCount }) => {
  const load = students.length;
  const cap = mentor.capacity;
  const remaining = cap - load;
  const canAccept =
    !overCapacity && mentor.is_accepting_students && incomingCount <= remaining;

  const updateCapacity = useUpdateMentorCapacity();
  const canDecrease = cap > load && cap > CAPACITY_MIN && !updateCapacity.isPending;
  const canIncrease = cap < CAPACITY_MAX && !updateCapacity.isPending;

  const adjust = async (delta: 1 | -1) => {
    const next = cap + delta;
    if (delta === -1 && next < load) {
      toast.error(`Can't lower below current load (${load}). Reassign students first.`);
      return;
    }
    if (next < CAPACITY_MIN || next > CAPACITY_MAX) return;
    try {
      await updateCapacity.mutateAsync({ userId: mentor.user_id, capacity: next });
    } catch (e) {
      toast.error(`Could not update capacity: ${String(e)}`);
    }
  };

  return (
    <Card
      className={[
        'flex h-full flex-col',
        overCapacity && 'ring-1 ring-destructive/50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-800/30 to-transparent text-sm font-bold text-primary">
            {initials(mentor.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-tight truncate">
              {mentor.full_name ?? 'Unnamed mentor'}
            </CardTitle>
            {!mentor.is_accepting_students && (
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Not accepting students
              </div>
            )}
          </div>
          <div className="text-right text-xs tabular-nums">
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                aria-label="Decrease capacity"
                title={
                  cap <= load
                    ? `Reassign students before lowering below ${load}`
                    : 'Decrease capacity'
                }
                onClick={(e) => {
                  e.stopPropagation();
                  adjust(-1);
                }}
                disabled={!canDecrease}
                className="grid h-5 w-5 place-items-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-30 disabled:hover:border-border disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span
                className={[
                  'min-w-[44px] text-center font-semibold',
                  load >= cap ? 'text-primary' : 'text-foreground',
                  load > cap && 'text-destructive',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {load} / {cap}
              </span>
              <button
                type="button"
                aria-label="Increase capacity"
                title="Increase capacity"
                onClick={(e) => {
                  e.stopPropagation();
                  adjust(1);
                }}
                disabled={!canIncrease}
                className="grid h-5 w-5 place-items-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-30 disabled:hover:border-border disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {remaining > 0
                ? `${remaining} slot${remaining === 1 ? '' : 's'}`
                : load === cap
                ? 'full'
                : `+${load - cap} over`}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <DropContainer id={`mentor:${mentor.user_id}`} canAccept={canAccept}>
          {students.length === 0 ? (
            <div className="grid h-full min-h-[96px] place-items-center rounded-md border border-dashed border-border/40 text-xs text-muted-foreground">
              Drop students here
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {students.map((s) => (
                <StudentChip
                  key={s.id}
                  student={s}
                  containerId={`mentor:${mentor.user_id}`}
                />
              ))}
            </div>
          )}
        </DropContainer>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Unassigned pool card
// ────────────────────────────────────────────────────────────────────────
const PoolCard: React.FC<{ students: StudentRow[] }> = ({ students }) => {
  return (
    <Card className="flex h-full flex-col border-orange-500/30 bg-gradient-to-b from-orange-900/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm leading-tight">Unassigned</CardTitle>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Pool of students waiting for a mentor
            </div>
          </div>
          <div className="text-right text-xs tabular-nums">
            <div className="font-semibold">{students.length}</div>
            <div className="text-[10px] text-muted-foreground">
              student{students.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <DropContainer id={POOL_ID} canAccept={true}>
          {students.length === 0 ? (
            <div className="grid h-full min-h-[96px] place-items-center rounded-md border border-dashed border-border/40 text-xs text-muted-foreground">
              ✓ All students assigned
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {students.map((s) => (
                <StudentChip key={s.id} student={s} containerId={POOL_ID} />
              ))}
            </div>
          )}
        </DropContainer>
      </CardContent>
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────
const AdminMentorAssignments: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: editions = [], isLoading: editionsLoading } = useEditionsList();
  const [editionId, setEditionId] = useState<string | null>(null);

  // Default to first edition when the list loads.
  React.useEffect(() => {
    if (!editionId && editions.length > 0) {
      setEditionId(editions[0].id);
    }
  }, [editions, editionId]);

  const { data: mentors = [], isLoading: mentorsLoading } = useMentors();
  const { data: allStudents = [], isLoading: studentsLoading } =
    useStudentsInEdition(editionId);
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useAssignmentsForEdition(editionId);

  const assignMutation = useAssignStudent();
  const unassignMutation = useUnassignStudent();

  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  // Build a map: mentor_user_id → students[].
  const { poolStudents, byMentor } = useMemo(() => {
    const assignedMap = new Map<string, AssignmentRow>();
    assignments.forEach((a) => assignedMap.set(a.student_user_id, a));

    const pool: StudentRow[] = [];
    const byM = new Map<string, StudentRow[]>();
    mentors.forEach((m) => byM.set(m.user_id, []));

    allStudents.forEach((s) => {
      const a = assignedMap.get(s.id);
      if (a && byM.has(a.mentor_user_id)) {
        byM.get(a.mentor_user_id)!.push(s);
      } else {
        pool.push(s);
      }
    });

    return { poolStudents: pool, byMentor: byM };
  }, [mentors, allStudents, assignments]);

  // Stats for header
  const totalStudents = allStudents.length;
  const totalAssigned = totalStudents - poolStudents.length;
  const totalCapacity = mentors.reduce((sum, m) => sum + m.capacity, 0);

  // ─── Drag handlers ───
  const onDragStart = (e: DragStartEvent) => {
    setDraggingStudentId(
      typeof e.active.data.current?.studentId === 'string'
        ? e.active.data.current.studentId
        : null,
    );
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const active = e.active;
    const over = e.over;
    setDraggingStudentId(null);
    if (!over || !editionId) return;

    const studentId = active.data.current?.studentId as string | undefined;
    const fromContainer = active.data.current?.fromContainer as string | undefined;
    const toContainer = over.id as string;

    if (!studentId || !fromContainer || fromContainer === toContainer) return;

    if (toContainer === POOL_ID) {
      // Unassign → find the existing assignment and delete it.
      const existing = assignments.find((a) => a.student_user_id === studentId);
      if (!existing) return;
      try {
        await unassignMutation.mutateAsync({
          assignmentId: existing.id,
          editionId,
        });
        toast.success('Student moved back to Unassigned');
      } catch (err) {
        toast.error(`Could not unassign: ${String(err)}`);
      }
      return;
    }

    if (toContainer.startsWith('mentor:')) {
      const mentorUserId = toContainer.slice('mentor:'.length);
      const mentor = mentors.find((m) => m.user_id === mentorUserId);
      if (!mentor) return;
      const currentLoad = byMentor.get(mentorUserId)?.length ?? 0;

      if (!mentor.is_accepting_students) {
        toast.error(`${mentor.full_name} is not accepting students right now`);
        return;
      }
      if (currentLoad >= mentor.capacity) {
        toast.error(`${mentor.full_name} is at capacity (${mentor.capacity} / ${mentor.capacity})`);
        return;
      }
      try {
        await assignMutation.mutateAsync({
          mentorUserId,
          studentUserId: studentId,
          editionId,
        });
        toast.success(`Assigned to ${mentor.full_name ?? 'mentor'}`);
      } catch (err) {
        toast.error(`Could not assign: ${String(err)}`);
      }
    }
  };

  // ─── Auto-balance: distribute pool across mentors with open slots ───
  const autoBalance = async () => {
    if (!editionId) return;
    const pool = [...poolStudents];
    if (pool.length === 0) {
      toast.info('No unassigned students to distribute');
      return;
    }
    const workingLoad = new Map<string, number>();
    mentors.forEach((m) => workingLoad.set(m.user_id, byMentor.get(m.user_id)?.length ?? 0));

    const assignments: { mentor: MentorRow; student: StudentRow }[] = [];
    while (pool.length > 0) {
      const pick = mentors
        .filter((m) => m.is_accepting_students)
        .map((m) => ({ m, left: m.capacity - (workingLoad.get(m.user_id) ?? 0) }))
        .filter((x) => x.left > 0)
        .sort((a, b) => b.left - a.left)[0];
      if (!pick) break;
      const student = pool.shift()!;
      assignments.push({ mentor: pick.m, student });
      workingLoad.set(pick.m.user_id, (workingLoad.get(pick.m.user_id) ?? 0) + 1);
    }

    if (assignments.length === 0) {
      toast.error('No mentor has open slots');
      return;
    }

    for (const a of assignments) {
      try {
        await assignMutation.mutateAsync({
          mentorUserId: a.mentor.user_id,
          studentUserId: a.student.id,
          editionId,
        });
      } catch (err) {
        toast.error(`Failed on ${a.student.full_name}: ${String(err)}`);
        break;
      }
    }
    queryClient.invalidateQueries({ queryKey: ['admin', 'assignments', editionId] });
    toast.success(`Assigned ${assignments.length} student${assignments.length === 1 ? '' : 's'}`);
  };

  const loading = editionsLoading || mentorsLoading || studentsLoading || assignmentsLoading;

  // ─── UI ───
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mentors.length} mentor{mentors.length === 1 ? '' : 's'} ·{' '}
            <span className="text-foreground font-medium">{totalAssigned}</span> of{' '}
            {totalStudents} assigned ·{' '}
            <span className="text-foreground font-medium">{totalCapacity}</span> total capacity
            {poolStudents.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-orange-500">
                <AlertCircle className="h-3.5 w-3.5" />
                {poolStudents.length} unassigned
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={editionId ?? undefined}
            onValueChange={(v) => setEditionId(v)}
            disabled={editionsLoading || editions.length === 0}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Pick an edition" />
            </SelectTrigger>
            <SelectContent>
              {editions.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name} · {e.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={autoBalance} disabled={!editionId || loading}>
            Auto-balance
          </Button>
          <AddMentorDialog />
        </div>
      </div>

      {loading && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}

      {!loading && !editionId && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Pick an edition to start assigning.
        </div>
      )}

      {!loading && editionId && mentors.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No mentors yet. Grant the mentor role to a user from the Users page, then reload.
        </div>
      )}

      {!loading && editionId && mentors.length > 0 && (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            {/* Pool */}
            <div className="lg:row-span-2">
              <PoolCard students={poolStudents} />
            </div>

            {/* Mentors grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((m) => {
                const students = byMentor.get(m.user_id) ?? [];
                return (
                  <MentorCard
                    key={m.user_id}
                    mentor={m}
                    students={students}
                    overCapacity={students.length > m.capacity}
                    incomingCount={1}
                  />
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {draggingStudentId ? (
              <div className="rounded-md border border-primary/40 bg-card px-2.5 py-1.5 shadow-lg">
                <span className="text-xs font-medium">
                  {allStudents.find((s) => s.id === draggingStudentId)?.full_name ??
                    'Student'}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default AdminMentorAssignments;

// ────────────────────────────────────────────────────────────────────────
// "+ Add mentor" dialog — grants mentor role + creates mentor_profile.
// ────────────────────────────────────────────────────────────────────────
const AddMentorDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number>(5);
  const { data: candidates = [], isLoading } = useMentorCandidates(search);
  const grant = useGrantMentorRole();

  const reset = () => {
    setSearch('');
    setSelectedUserId(null);
    setCapacity(5);
  };

  const onSubmit = async () => {
    if (!selectedUserId) return;
    try {
      await grant.mutateAsync({ userId: selectedUserId, capacity });
      toast.success('Mentor added');
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(`Could not grant mentor role: ${String(err)}`);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>+ Add mentor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a mentor</DialogTitle>
          <DialogDescription>
            Grants the <code className="text-xs">mentor</code> role to an existing user and creates
            their mentor profile with a default capacity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Find user</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="mt-1"
            />
          </div>
          <div className="max-h-60 overflow-y-auto rounded-md border border-border">
            {isLoading && (
              <div className="p-3 text-xs text-muted-foreground">Searching…</div>
            )}
            {!isLoading && candidates.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">No matching users.</div>
            )}
            {candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedUserId(c.id)}
                className={[
                  'flex w-full items-center justify-between gap-3 border-b border-border/40 px-3 py-2 text-left text-sm last:border-b-0',
                  selectedUserId === c.id && 'bg-primary/10',
                  'hover:bg-muted/40',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="font-medium">{c.full_name ?? 'Unnamed'}</span>
                <span className="text-xs text-muted-foreground">{c.email ?? '—'}</span>
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="capacity">Capacity (1–20)</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="mt-1 w-24"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Default students they can take on. Can be adjusted later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedUserId || grant.isPending}
          >
            {grant.isPending ? 'Adding…' : 'Add mentor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
