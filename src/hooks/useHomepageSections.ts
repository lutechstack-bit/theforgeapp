import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { promiseWithTimeout } from '@/lib/promiseTimeout';

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  is_visible: boolean;
  order_index: number;
  cohort_types: string[] | null;
}

export const useHomepageSections = () => {
  const { edition, userDataLoading } = useAuth();
  const userCohortType = edition?.cohort_type;

  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('homepage_sections')
          .select('*')
          .order('order_index', { ascending: true })
          .then(res => res),
        10000,
        'homepage_sections'
      );
      if (result.error) throw result.error;
      return result.data as HomepageSection[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !userDataLoading,
  });

  // Filter sections by visibility and cohort type
  const visibleSections = useMemo(() => {
    if (!sections) return [];
    
    return sections.filter(section => {
      if (!section.is_visible) return false;
      
      // If cohort_types is set, filter by user's cohort
      if (section.cohort_types && section.cohort_types.length > 0 && userCohortType) {
        return section.cohort_types.includes(userCohortType);
      }
      
      return true;
    });
  }, [sections, userCohortType]);

  // Helper to get section config by key
  const getSection = (key: string) => {
    return visibleSections.find(s => s.section_key === key);
  };

  return {
    sections: visibleSections,
    getSection,
    isLoading: isLoading || userDataLoading,
  };
};
