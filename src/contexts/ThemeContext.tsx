import React, { createContext, useContext } from 'react';

type CohortType = 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';

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
  FORGE: {
    name: 'The Forge',
    description: 'Master the art of filmmaking',
    logo: '/src/assets/forge-logo.png',
  },
  FORGE_WRITING: {
    name: 'The Forge Writing',
    description: 'Craft compelling screenplays',
    logo: '/src/assets/forge-writing-logo.png',
  },
  FORGE_CREATORS: {
    name: 'The Forge Creators',
    description: 'Build your creator career',
    logo: '/src/assets/forge-creators-logo.png',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  cohortType: 'FORGE',
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
      cohortType: 'FORGE', // Default, actual cohort comes from AuthContext
      cohortName: cohortInfo.FORGE.name,
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
