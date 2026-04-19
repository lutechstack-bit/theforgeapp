import { useAuth, Edition } from '@/contexts/AuthContext';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CohortType } from '@/contexts/ThemeContext';

export const useEffectiveCohort = () => {
  const { edition, userDataLoading } = useAuth();
  const { isTestingMode, simulatedCohortType, simulatedEditionId } = useAdminTestingSafe();

  // We're simulating whenever the admin has picked a different edition than
  // their own — this covers cross-cohort simulation (FORGE -> WRITING) AND
  // same-cohort edition swapping (E16 -> E17) which the old cohort-type check
  // missed.
  const hasEditionOverride = isTestingMode && !!simulatedEditionId && simulatedEditionId !== edition?.id;
  const hasCohortOverride = isTestingMode && !!simulatedCohortType && simulatedCohortType !== edition?.cohort_type;
  const isSimulating = hasEditionOverride || hasCohortOverride;

  // Fetch the simulated edition row whenever an override id is set.
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
        forge_start_date: data.forge_start_date,
        forge_end_date: data.forge_end_date,
        cohort_type: data.cohort_type as Edition['cohort_type'],
        city: data.city,
        online_start_date: data.online_start_date,
        online_end_date: data.online_end_date,
      } as Edition;
    },
    enabled: isTestingMode && !!simulatedEditionId,
    staleTime: 10 * 60 * 1000,
  });

  // When simulating, derive the cohort type from the simulated edition so the
  // picker only needs to set editionId — cohort follows automatically. Falls
  // back to simulatedCohortType for backwards compat, then to the real cohort.
  const effectiveCohortType: CohortType | undefined =
    (isSimulating && (simEdition?.cohort_type || simulatedCohortType)) ||
    (edition?.cohort_type as CohortType | undefined);

  const effectiveEdition: Edition | null =
    (isSimulating && simEdition) ? simEdition : edition;

  return {
    effectiveCohortType,
    effectiveEdition,
    isSimulating,
    isLoading: userDataLoading,
  };
};
