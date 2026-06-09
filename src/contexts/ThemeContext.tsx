import React, { createContext, useContext } from 'react';
import forgeLogoImg from '@/assets/forge-logo.png';
import forgeWritingLogoImg from '@/assets/forge-writing-logo.png';
import forgeCreatorsLogoImg from '@/assets/forge-creators-logo.png';

type CohortType = 'FFM' | 'FW' | 'FC' | 'FAI';

interface CohortInfo {
  name: string;
  description: string;
  logo: string;
}

interface ThemeContextType {
  cohortType: CohortType;
  cohortName: string;
  allCohorts: Record<CohortType, CohortInfo>;
  getOtherCohorts: (current: CohortType) => Array<{ type: CohortType } & CohortInfo>;
}

// Cohort metadata for cross-sell
const cohortInfo: Record<CohortType, CohortInfo> = {
  FFM: {
    name: 'The Forge',
    description: 'Master the art of filmmaking',
    logo: forgeLogoImg,
  },
  FW: {
    name: 'The Forge Writing',
    description: 'Craft compelling screenplays',
    logo: forgeWritingLogoImg,
  },
  FC: {
    name: 'The Forge Creators',
    description: 'Build your creator career',
    logo: forgeCreatorsLogoImg,
  },
  FAI: {
    name: 'Forge AI',
    description: 'Build, automate, and launch with AI',
    logo: forgeLogoImg,
  },
};

const ThemeContext = createContext<ThemeContextType>({
  cohortType: 'FFM',
  cohortName: 'The Forge',
  allCohorts: cohortInfo,
  getOtherCohorts: () => [],
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // With unified theme, we no longer fetch cohort type for theming
  // But we still need to know the user's cohort for displaying cohort name and cross-sell

  const getOtherCohorts = (current: CohortType) => {
    return (Object.keys(cohortInfo) as CohortType[])
      .filter(type => type !== current)
      .map(type => ({ type, ...cohortInfo[type] }));
  };

  return (
    <ThemeContext.Provider value={{
      cohortType: 'FFM', // Default, actual cohort comes from AuthContext
      cohortName: cohortInfo.FFM.name,
      allCohorts: cohortInfo,
      getOtherCohorts,
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

export { cohortInfo };
export type { CohortType, CohortInfo };
