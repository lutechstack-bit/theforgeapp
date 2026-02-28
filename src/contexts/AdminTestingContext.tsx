import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CohortType } from '@/contexts/ThemeContext';

type ForgeMode = 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';

interface AdminTestingState {
  isTestingMode: boolean;
  simulatedForgeMode: ForgeMode | null;
  simulatedDayNumber: number | null;
  simulatedCohortType: CohortType | null;
  simulatedEditionId: string | null;
}

interface AdminTestingContextType extends AdminTestingState {
  setTestingMode: (enabled: boolean) => void;
  setSimulatedForgeMode: (mode: ForgeMode | null) => void;
  setSimulatedDayNumber: (day: number | null) => void;
  setSimulatedCohortType: (cohort: CohortType | null) => void;
  setSimulatedEditionId: (id: string | null) => void;
  applyPreset: (preset: 'pre' | 'online-1' | 'online-3' | 'physical-5' | 'physical-10' | 'last-day' | 'post') => void;
  resetToRealTime: () => void;
}

const STORAGE_KEY = 'adminTestingMode';

const defaultState: AdminTestingState = {
  isTestingMode: false,
  simulatedForgeMode: null,
  simulatedDayNumber: null,
  simulatedCohortType: null,
  simulatedEditionId: null,
};

const AdminTestingContext = createContext<AdminTestingContextType | undefined>(undefined);

export const AdminTestingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdminTestingState>(() => {
    // Initialize from sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultState;
        }
      }
    }
    return defaultState;
  });

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setTestingMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isTestingMode: enabled,
      // Reset simulations when disabling
      ...(enabled ? {} : { simulatedForgeMode: null, simulatedDayNumber: null, simulatedCohortType: null, simulatedEditionId: null }),
    }));
  }, []);

  const setSimulatedForgeMode = useCallback((mode: ForgeMode | null) => {
    setState(prev => ({
      ...prev,
      simulatedForgeMode: mode,
      isTestingMode: mode !== null ? true : prev.isTestingMode,
    }));
  }, []);

  const setSimulatedDayNumber = useCallback((day: number | null) => {
    setState(prev => ({
      ...prev,
      simulatedDayNumber: day,
      isTestingMode: day !== null ? true : prev.isTestingMode,
    }));
  }, []);

  const setSimulatedCohortType = useCallback((cohort: CohortType | null) => {
    setState(prev => ({
      ...prev,
      simulatedCohortType: cohort,
      isTestingMode: cohort !== null ? true : prev.isTestingMode,
    }));
  }, []);

  const setSimulatedEditionId = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      simulatedEditionId: id,
    }));
  }, []);

  const applyPreset = useCallback((preset: 'pre' | 'online-1' | 'online-3' | 'physical-5' | 'physical-10' | 'last-day' | 'post') => {
    switch (preset) {
      case 'pre':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'PRE_FORGE', simulatedDayNumber: null }));
        break;
      case 'online-1':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 1 }));
        break;
      case 'online-3':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 3 }));
        break;
      case 'physical-5':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 5 }));
        break;
      case 'physical-10':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 10 }));
        break;
      case 'last-day':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 14 }));
        break;
      case 'post':
        setState(prev => ({ ...prev, isTestingMode: true, simulatedForgeMode: 'POST_FORGE', simulatedDayNumber: null }));
        break;
    }
  }, []);

  const resetToRealTime = useCallback(() => {
    setState(defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminTestingContext.Provider
      value={{
        ...state,
        setTestingMode,
        setSimulatedForgeMode,
        setSimulatedDayNumber,
        setSimulatedCohortType,
        setSimulatedEditionId,
        applyPreset,
        resetToRealTime,
      }}
    >
      {children}
    </AdminTestingContext.Provider>
  );
};

export const useAdminTesting = () => {
  const context = useContext(AdminTestingContext);
  if (context === undefined) {
    throw new Error('useAdminTesting must be used within an AdminTestingProvider');
  }
  return context;
};

// Safe hook that returns defaults when outside provider (for non-admin contexts)
export const useAdminTestingSafe = (): AdminTestingState => {
  const context = useContext(AdminTestingContext);
  return context || defaultState;
};
