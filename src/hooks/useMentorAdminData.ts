import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin-only hooks for the mentor-assignments page.
 *
 * All mutations rely on RLS ("Admins manage all assignments"/"Admins manage all
 * mentor profiles"), so the caller must already be an admin.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

/**
 * If a Supabase error matches a known "migrations not applied" failure mode,
 * re-throw it as a friendly Error explaining which migration to apply.
 * Otherwise re-throw as-is.
 *
 * Covers:
 *   - Postgres 22P02 ("invalid input syntax") for missing enum value
 *   - Postgres 42P01 ("undefined_table")
 *   - PostgREST PGRST205 ("Could not find the table ... in the schema cache")
 */
const guardMentorSchemaError = (err: unknown): never => {
  const e = (err ?? {}) as { code?: string; message?: string };
  const msg = e.message ?? '';

  // Missing enum value — Postgres 22P02.
  if (e.code === '22P02' || /enum app_role/i.test(msg)) {
    if (/mentor/i.test(msg) && /enum/i.test(msg)) {
      throw new Error(
        "The 'mentor' role isn't in the app_role enum yet. Apply migration " +
        '20260424100000_add_mentor_role.sql to your Supabase project and try again.',
      );
    }
  }

  // Missing table — Postgres 42P01 OR PostgREST PGRST205 (schema cache miss).
  const isMissingTable =
    e.code === '42P01' ||
    e.code === 'PGRST205' ||
    /relation .*does not exist/i.test(msg) ||
    /could not find the table .* in the schema cache/i.test(msg);

  if (isMissingTable) {
    if (/mentor_profiles|mentor_assignments/i.test(msg)) {
      throw new Error(
        "The mentor tables don't exist yet. Apply migration " +
        '20260424100100_mentor_assignments.sql in the Supabase SQL editor, ' +
        "then run NOTIFY pgrst, 'reload schema'; and try again.",
      );
    }
    if (/mentor_notes/i.test(msg)) {
      throw new Error(
        "The mentor_notes table doesn't exist yet. Apply migration " +
        '20260424100200_mentor_notes.sql and try again.',
      );
    }
    if (/doubts|doubt_replies/i.test(msg)) {
      throw new Error(
        "The doubts tables don't exist yet. Apply migration " +
        '20260424100300_doubts.sql and try again.',
      );
    }
    if (/submissions|submission_feedback/i.test(msg)) {
      throw new Error(
        "The submissions tables don't exist yet. Apply migration " +
        '20260424100400_submissions.sql and try again.',
      );
    }
    if (/targeted_cards/i.test(msg)) {
      throw new Error(
        "The targeted_cards table doesn't exist yet. Apply migration " +
        '20260424100500_targeted_cards.sql and try again.',
      );
    }
  }

  // Pass-through: preserve message + code so the toast helper has something useful.
  if (typeof e === 'object' && msg) throw new Error(msg + (e.code ? ` [${e.code}]` : ''));
  throw err;
};

export type MentorRow = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  capacity: number;
  is_accepting_students: boolean;
};

export type StudentRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  edition_id: string | null;
};

export type AssignmentRow = {
  id: string;
  mentor_user_id: string;
  student_user_id: string;
  edition_id: string | null;
  assigned_at: string;
};

// ─── Mentors ──────────────────────────────────────────────────────────────
// Users with the 'mentor' role, joined with their mentor_profiles row and
// a display name / avatar from profiles.
export const useMentors = () =>
  useQuery<MentorRow[]>({
    queryKey: ['admin', 'mentors'],
    queryFn: async () => {
      const { data: roleRows, error: roleErr } = await sb
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor');
      if (roleErr) throw roleErr;

      const userIds = (roleRows ?? []).map((r: { user_id: string }) => r.user_id);
      if (userIds.length === 0) return [];

      const [{ data: profiles, error: profErr }, { data: mProfiles, error: mpErr }] =
        await Promise.all([
          sb
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds),
          sb
            .from('mentor_profiles')
            .select('user_id, capacity, is_accepting_students')
            .in('user_id', userIds),
        ]);
      if (profErr) throw profErr;
      if (mpErr) throw mpErr;

      const mpByUser = new Map<
        string,
        { capacity: number; is_accepting_students: boolean }
      >();
      (mProfiles ?? []).forEach(
        (m: { user_id: string; capacity: number; is_accepting_students: boolean }) =>
          mpByUser.set(m.user_id, {
            capacity: m.capacity,
            is_accepting_students: m.is_accepting_students,
          }),
      );

      return (profiles ?? []).map((p: { id: string; full_name: string | null; avatar_url: string | null }) => ({
        user_id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        capacity: mpByUser.get(p.id)?.capacity ?? 5,
        is_accepting_students: mpByUser.get(p.id)?.is_accepting_students ?? true,
      }));
    },
    staleTime: 60 * 1000,
  });

// ─── Students in an edition ───────────────────────────────────────────────
// Everyone in the edition who is *not* a mentor or admin. Admins are filtered
// via profiles.is_admin; mentors via user_roles.
export const useStudentsInEdition = (editionId: string | null) =>
  useQuery<StudentRow[]>({
    queryKey: ['admin', 'students-in-edition', editionId],
    queryFn: async () => {
      if (!editionId) return [];

      const { data: profiles, error: profErr } = await sb
        .from('profiles')
        .select('id, full_name, avatar_url, edition_id, is_admin')
        .eq('edition_id', editionId);
      if (profErr) throw profErr;

      const nonAdmin = (profiles ?? []).filter(
        (p: { is_admin?: boolean | null }) => !p.is_admin,
      );
      const ids = nonAdmin.map((p: { id: string }) => p.id);
      if (ids.length === 0) return [];

      const { data: mentorRows, error: mentorErr } = await sb
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor')
        .in('user_id', ids);
      if (mentorErr) throw mentorErr;

      const mentorSet = new Set<string>(
        (mentorRows ?? []).map((r: { user_id: string }) => r.user_id),
      );

      return nonAdmin
        .filter((p: { id: string }) => !mentorSet.has(p.id))
        .map((p: { id: string; full_name: string | null; avatar_url: string | null; edition_id: string | null }) => ({
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          edition_id: p.edition_id,
        }));
    },
    enabled: !!editionId,
    staleTime: 60 * 1000,
  });

// ─── Assignments for an edition ──────────────────────────────────────────
export const useAssignmentsForEdition = (editionId: string | null) =>
  useQuery<AssignmentRow[]>({
    queryKey: ['admin', 'assignments', editionId],
    queryFn: async () => {
      if (!editionId) return [];
      const { data, error } = await sb
        .from('mentor_assignments')
        .select('id, mentor_user_id, student_user_id, edition_id, assigned_at')
        .eq('edition_id', editionId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!editionId,
    staleTime: 30 * 1000,
  });

// ─── Mutations ────────────────────────────────────────────────────────────
export const useAssignStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      mentorUserId: string;
      studentUserId: string;
      editionId: string;
    }) => {
      // Upsert on (student_user_id, edition_id) so a reassignment replaces the
      // existing row atomically. The UNIQUE constraint on that pair backs this.
      const { data, error } = await sb
        .from('mentor_assignments')
        .upsert(
          {
            mentor_user_id: args.mentorUserId,
            student_user_id: args.studentUserId,
            edition_id: args.editionId,
          },
          { onConflict: 'student_user_id,edition_id' },
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments', vars.editionId] });
    },
  });
};

export const useUnassignStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { assignmentId: string; editionId: string }) => {
      const { error } = await sb
        .from('mentor_assignments')
        .delete()
        .eq('id', args.assignmentId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'assignments', vars.editionId] });
    },
  });
};

// ─── Candidate users for granting mentor role ────────────────────────────
// Lists users who don't already hold the 'mentor' role. We don't filter admins
// out here — an admin *can* be a mentor too.
export const useMentorCandidates = (search: string) =>
  useQuery<{ id: string; full_name: string | null; email: string | null }[]>({
    queryKey: ['admin', 'mentor-candidates', search],
    queryFn: async () => {
      const { data: mentorRows, error: mErr } = await sb
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor');
      if (mErr) throw mErr;
      const existingMentors = new Set<string>(
        (mentorRows ?? []).map((r: { user_id: string }) => r.user_id),
      );

      let q = sb.from('profiles').select('id, full_name, email').limit(50);
      if (search.trim()) {
        q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data: profiles, error: pErr } = await q;
      if (pErr) throw pErr;
      return (profiles ?? []).filter((p: { id: string }) => !existingMentors.has(p.id));
    },
    staleTime: 20 * 1000,
  });

/**
 * Update a mentor's capacity. The DB CHECK enforces 1–20; the call-site
 * should also avoid dropping capacity below the mentor's current load.
 */
export const useUpdateMentorCapacity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { userId: string; capacity: number }) => {
      if (args.capacity < 1 || args.capacity > 20)
        throw new Error('Capacity must be between 1 and 20');
      const { error } = await sb
        .from('mentor_profiles')
        .update({ capacity: args.capacity })
        .eq('user_id', args.userId);
      if (error) guardMentorSchemaError(error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'mentors'] });
    },
  });
};

/**
 * Map of mentor user_id → { capacity }. Used by the Users table to render
 * a "mentor" badge AND to support inline capacity editing without a
 * per-row capacity fetch.
 *
 * Use `.has(id)` for the role check (Map's API matches the old Set), and
 * `.get(id)?.capacity` for the capacity readout.
 */
export const useMentorRoleSet = () =>
  useQuery<Map<string, { capacity: number; is_accepting_students: boolean }>>({
    queryKey: ['admin', 'mentor-role-set'],
    queryFn: async () => {
      const { data: roleRows, error: roleErr } = await sb
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor');
      if (roleErr) throw roleErr;

      const ids = (roleRows ?? []).map((r: { user_id: string }) => r.user_id);
      if (ids.length === 0) return new Map();

      const { data: profiles, error: profErr } = await sb
        .from('mentor_profiles')
        .select('user_id, capacity, is_accepting_students')
        .in('user_id', ids);
      if (profErr) throw profErr;

      const out = new Map<string, { capacity: number; is_accepting_students: boolean }>();
      ids.forEach((id: string) => out.set(id, { capacity: 5, is_accepting_students: true }));
      (profiles ?? []).forEach(
        (p: { user_id: string; capacity: number; is_accepting_students: boolean }) =>
          out.set(p.user_id, { capacity: p.capacity, is_accepting_students: p.is_accepting_students }),
      );
      return out;
    },
    staleTime: 60 * 1000,
  });

/**
 * Bulk-grant the mentor role to many users at once. Each row is upserted
 * into user_roles + mentor_profiles in two batched statements. Idempotent:
 * users who already have the role are skipped (UNIQUE constraint).
 */
export const useBulkGrantMentorRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { userIds: string[]; capacity: number }) => {
      if (args.capacity < 1 || args.capacity > 20)
        throw new Error('Capacity must be between 1 and 20');
      if (args.userIds.length === 0) return { granted: 0, skipped: 0 };

      // user_roles INSERT (no upsert on user_roles — UNIQUE(user_id, role)
      // means duplicates error; we filter via insert with onConflict ignore).
      // The supabase client's `upsert` with onConflict skips dupes.
      const { error: roleErr } = await sb
        .from('user_roles')
        .upsert(
          args.userIds.map((user_id) => ({ user_id, role: 'mentor' })),
          { onConflict: 'user_id,role', ignoreDuplicates: true },
        );
      if (roleErr) guardMentorSchemaError(roleErr);

      // mentor_profiles upsert: only sets capacity if a row didn't already
      // exist. We use ignoreDuplicates so existing capacities aren't
      // overwritten — admins edit those inline.
      const { error: profErr } = await sb
        .from('mentor_profiles')
        .upsert(
          args.userIds.map((user_id) => ({ user_id, capacity: args.capacity })),
          { onConflict: 'user_id', ignoreDuplicates: true },
        );
      if (profErr) guardMentorSchemaError(profErr);

      return { granted: args.userIds.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'mentors'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-candidates'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-role-set'] });
    },
  });
};

/**
 * Revoke the mentor role from a user. The mentor_profiles row is kept
 * (history) and mentor_assignments are kept too — if the role is re-granted
 * later, prior context is intact. Deleting assignments is a separate,
 * deliberate action on the Mentor Assignments page.
 */
export const useRevokeMentorRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { userId: string }) => {
      const { error } = await sb
        .from('user_roles')
        .delete()
        .eq('user_id', args.userId)
        .eq('role', 'mentor');
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'mentors'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-candidates'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-role-set'] });
    },
  });
};

// Grant mentor role + create a mentor_profiles row with a default capacity.
export const useGrantMentorRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { userId: string; capacity: number }) => {
      // INSERT into user_roles (UNIQUE on (user_id, role) guards duplicates).
      const { error: roleErr } = await sb
        .from('user_roles')
        .insert({ user_id: args.userId, role: 'mentor' });
      if (roleErr) guardMentorSchemaError(roleErr);

      // Upsert the mentor_profile so re-granting after a revoke still works.
      const { error: profErr } = await sb
        .from('mentor_profiles')
        .upsert(
          { user_id: args.userId, capacity: args.capacity },
          { onConflict: 'user_id' },
        );
      if (profErr) guardMentorSchemaError(profErr);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'mentors'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-candidates'] });
      qc.invalidateQueries({ queryKey: ['admin', 'mentor-role-set'] });
    },
  });
};

// ─── Editions picker ──────────────────────────────────────────────────────
export const useEditionsList = () =>
  useQuery<{ id: string; name: string; city: string; cohort_type: string }[]>({
    queryKey: ['admin', 'editions-list'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('editions')
        .select('id, name, city, cohort_type, is_archived')
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
