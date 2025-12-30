import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type CohortType = 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';

interface ThemeContextType {
  cohortType: CohortType;
  cohortName: string;
  isLoading: boolean;
}

const cohortThemes: Record<CohortType, { cssClass: string; name: string }> = {
  FORGE: { cssClass: 'theme-forge', name: 'The Forge' },
  FORGE_WRITING: { cssClass: 'theme-forge-writing', name: 'The Forge Writing' },
  FORGE_CREATORS: { cssClass: 'theme-forge-creators', name: 'The Forge Creators' },
};

const ThemeContext = createContext<ThemeContextType>({
  cohortType: 'FORGE',
  cohortName: 'The Forge',
  isLoading: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [cohortType, setCohortType] = useState<CohortType>('FORGE');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEditionTheme = async () => {
      if (profile?.edition_id) {
        const { data } = await supabase
          .from('editions')
          .select('cohort_type')
          .eq('id', profile.edition_id)
          .single();

        if (data?.cohort_type) {
          setCohortType(data.cohort_type as CohortType);
        }
      }
      setIsLoading(false);
    };

    fetchEditionTheme();
  }, [profile?.edition_id]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-forge', 'theme-forge-writing', 'theme-forge-creators');
    
    // Add current theme class
    root.classList.add(cohortThemes[cohortType].cssClass);
  }, [cohortType]);

  return (
    <ThemeContext.Provider value={{
      cohortType,
      cohortName: cohortThemes[cohortType].name,
      isLoading,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
