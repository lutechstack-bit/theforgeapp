import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { promiseWithTimeout } from '@/lib/promiseTimeout';

/**
 * Checks whether the current user has the 'mentor' role via user_roles.
 *
 * Mirrors useAdminCheck in shape, but reads the user_roles table (which is
 * where every other role in the app is managed) instead of a boolean on
 * profiles. A single user can hold multiple roles (mentor + admin, etc).
 */

const MENTOR_CHECK_STALE_TIME = 10 * 60 * 1000; // 10 minutes
const MENTOR_CHECK_TIMEOUT = 8000;

export const useMentorCheck = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isMentor = false, isLoading } = useQuery({
    queryKey: ['mentor-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      try {
        // Cast: 'mentor' is added to public.app_role in migration
        // 20260424100000_add_mentor_role.sql. Once `supabase gen types` is
        // re-run after that migration applies, this cast can be removed.
        const result = await promiseWithTimeout(
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .eq('role', 'mentor' as any)
            .maybeSingle()
            .then((res) => res),
          MENTOR_CHECK_TIMEOUT,
          'Mentor check'
        );

        if (result.error) {
          // A row missing is fine — "not a mentor". Anything else, log and fail closed.
          console.error('Error checking mentor role:', result.error);
          return false;
        }

        return !!result.data;
      } catch (err) {
        console.error('Mentor check error:', err);
        return false;
      }
    },
    enabled: !!user?.id && !authLoading,
    staleTime: MENTOR_CHECK_STALE_TIME,
    gcTime: MENTOR_CHECK_STALE_TIME * 2,
    retry: 1,
  });

  return { isMentor, loading: authLoading || isLoading };
};
