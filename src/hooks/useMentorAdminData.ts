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
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'mentors'] });
    },
  });
};

/**
 * Bulk-fetch the set of user_ids that currently hold the 'mentor' role.
 * Used by the Users table to render a "mentor" badge without per-row queries.
 */
export const useMentorRoleSet = () =>
  useQuery<Set<string>>({
    queryKey: ['admin', 'mentor-role-set'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mentor');
      if (error) throw error;
      return new Set<string>((data ?? []).map((r: { user_id: string }) => r.user_id));
    },
    staleTime: 60 * 1000,
  });

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
      if (roleErr) throw roleErr;

      // Upsert the mentor_profile so re-granting after a revoke still works.
      const { error: profErr } = await sb
        .from('mentor_profiles')
        .upsert(
          { user_id: args.userId, capacity: args.capacity },
          { onConflict: 'user_id' },
        );
      if (profErr) throw profErr;
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
