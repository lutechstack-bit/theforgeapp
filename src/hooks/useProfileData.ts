import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileData {
  profile: any;
  kyfResponse: any | null;
  kywResponse: any | null;
  cohortType: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | null;
  messageCount: number;
  worksCount: number;
}

export const useProfileData = (userId?: string) => {
  const { user, profile, edition } = useAuth();
  const targetUserId = userId || user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profile-data', targetUserId],
    queryFn: async (): Promise<ProfileData> => {
      if (!targetUserId) {
        throw new Error('No user ID provided');
      }

      // Fetch profile if not using current user's
      let profileData = profile;
      let editionData = edition;
      
      if (userId && userId !== user?.id) {
        const { data: fetchedProfile } = await supabase
          .from('profiles')
          .select('*, editions(*)')
          .eq('id', userId)
          .single();
        
        profileData = fetchedProfile;
        editionData = fetchedProfile?.editions;
      }

      const cohortType = editionData?.cohort_type || null;

      // Fetch KYF response if FORGE cohort
      let kyfResponse = null;
      if (cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS') {
        const { data } = await supabase
          .from('kyf_responses')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();
        kyfResponse = data;
      }

      // Fetch KYW response if WRITING cohort
      let kywResponse = null;
      if (cohortType === 'FORGE_WRITING') {
        const { data } = await supabase
          .from('kyw_responses')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();
        kywResponse = data;
      }

      // Get message count
      const { count: messageCount } = await supabase
        .from('community_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      // Get works count
      const { count: worksCount } = await supabase
        .from('user_works')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      return {
        profile: profileData,
        kyfResponse,
        kywResponse,
        cohortType,
        messageCount: messageCount || 0,
        worksCount: worksCount || 0,
      };
    },
    enabled: !!targetUserId,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
