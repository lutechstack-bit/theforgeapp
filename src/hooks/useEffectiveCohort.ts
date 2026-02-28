import { useAuth, Edition } from '@/contexts/AuthContext';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CohortType } from '@/contexts/ThemeContext';

export const useEffectiveCohort = () => {
  const { edition, userDataLoading } = useAuth();
  const { isTestingMode, simulatedCohortType, simulatedEditionId } = useAdminTestingSafe();

  const isSimulating = isTestingMode && !!simulatedCohortType && simulatedCohortType !== edition?.cohort_type;

  // Fetch the simulated edition when admin switches cohort
  const { data: simEdition } = useQuery({
    queryKey: ['simulated-edition', simulatedEditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('id', simulatedEditionId!)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        forge_start_date: data.forge_start_date,
        forge_end_date: data.forge_end_date,
        cohort_type: data.cohort_type as Edition['cohort_type'],
        city: data.city,
      } as Edition;
    },
    enabled: isTestingMode && !!simulatedEditionId,
    staleTime: 10 * 60 * 1000,
  });

  const effectiveCohortType: CohortType | undefined =
    (isTestingMode && simulatedCohortType) || (edition?.cohort_type as CohortType | undefined);

  const effectiveEdition: Edition | null =
    (isSimulating && simEdition) ? simEdition : edition;

  return {
    effectiveCohortType,
    effectiveEdition,
    isSimulating,
    isLoading: userDataLoading,
  };
};
