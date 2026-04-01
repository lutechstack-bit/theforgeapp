import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  city: string | null;
  edition_name: string | null;
  cohort_type: string | null;
  ky_form_completed: boolean;
  profile_setup_completed: boolean;
  has_collaborator_profile: boolean;
  mbti_type: string | null;
  kyData: Record<string, any> | null;
  collabData: Record<string, any> | null;
}

export function useStudentKYData(cohortFilter: string | null) {
  return useQuery({
    queryKey: ['admin-student-ky-data', cohortFilter],
    queryFn: async () => {
      const [profilesRes, editionsRes, collabRes, kyfRes, kycRes, kywRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, city, edition_id, ky_form_completed, profile_setup_completed'),
        supabase.from('editions').select('id, name, cohort_type'),
        supabase.from('collaborator_profiles').select('user_id, tagline, intro, about, occupations, available_for_hire, open_to_remote, portfolio_url, portfolio_type'),
        supabase.from('kyf_responses').select('*'),
        supabase.from('kyc_responses').select('*'),
        supabase.from('kyw_responses').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const editionMap = new Map((editionsRes.data || []).map(e => [e.id, e]));
      const collabMap = new Map((collabRes.data || []).map((c: any) => [c.user_id, c]));
      const kyfMap = new Map((kyfRes.data || []).map((r: any) => [r.user_id, r]));
      const kycMap = new Map((kycRes.data || []).map((r: any) => [r.user_id, r]));
      const kywMap = new Map((kywRes.data || []).map((r: any) => [r.user_id, r]));

      const rows: StudentRow[] = (profilesRes.data || []).map((p: any) => {
        const edition = editionMap.get(p.edition_id) as any;
        const cohortType = edition?.cohort_type || null;
        let kyData: Record<string, any> | null = null;
        if (cohortType === 'FORGE') kyData = kyfMap.get(p.id) || null;
        else if (cohortType === 'FORGE_CREATORS') kyData = kycMap.get(p.id) || null;
        else if (cohortType === 'FORGE_WRITING') kyData = kywMap.get(p.id) || null;

        const collab = collabMap.get(p.id) || null;

        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          city: p.city,
          edition_name: edition?.name || null,
          cohort_type: cohortType,
          ky_form_completed: p.ky_form_completed,
          profile_setup_completed: p.profile_setup_completed,
          has_collaborator_profile: !!collab,
          mbti_type: kyData?.mbti_type || null,
          kyData,
          collabData: collab,
        };
      });

      if (cohortFilter) {
        return rows.filter(r => r.cohort_type === cohortFilter);
      }
      return rows;
    },
  });
}
