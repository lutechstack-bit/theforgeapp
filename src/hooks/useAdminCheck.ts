import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { promiseWithTimeout } from '@/lib/promiseTimeout';

// Cache admin check for 10 minutes to reduce backend calls
const ADMIN_CHECK_STALE_TIME = 10 * 60 * 1000;
const ADMIN_CHECK_TIMEOUT = 8000;

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const result = await promiseWithTimeout(
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle()
            .then(res => res),
          ADMIN_CHECK_TIMEOUT,
          'Admin check'
        );
        
        if (result.error) {
          console.error('Error checking admin role:', result.error);
          return false;
        }
        
        return !!result.data;
      } catch (err) {
        console.error('Admin check error:', err);
        return false;
      }
    },
    enabled: !!user?.id && !authLoading,
    staleTime: ADMIN_CHECK_STALE_TIME,
    gcTime: ADMIN_CHECK_STALE_TIME * 2,
    retry: 1,
  });

  return { isAdmin, loading: authLoading || isLoading };
};
