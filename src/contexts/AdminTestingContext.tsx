import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ForgeMode = 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';

interface AdminTestingState {
  isTestingMode: boolean;
  simulatedForgeMode: ForgeMode | null;
  simulatedDayNumber: number | null;
}

interface AdminTestingContextType extends AdminTestingState {
  setTestingMode: (enabled: boolean) => void;
  setSimulatedForgeMode: (mode: ForgeMode | null) => void;
  setSimulatedDayNumber: (day: number | null) => void;
  applyPreset: (preset: 'pre' | 'online-1' | 'online-3' | 'physical-5' | 'physical-10' | 'last-day' | 'post') => void;
  resetToRealTime: () => void;
}

const STORAGE_KEY = 'adminTestingMode';

const defaultState: AdminTestingState = {
  isTestingMode: false,
  simulatedForgeMode: null,
  simulatedDayNumber: null,
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
      ...(enabled ? {} : { simulatedForgeMode: null, simulatedDayNumber: null }),
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

  const applyPreset = useCallback((preset: 'pre' | 'online-1' | 'online-3' | 'physical-5' | 'physical-10' | 'last-day' | 'post') => {
    switch (preset) {
      case 'pre':
        setState({ isTestingMode: true, simulatedForgeMode: 'PRE_FORGE', simulatedDayNumber: null });
        break;
      case 'online-1':
        setState({ isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 1 });
        break;
      case 'online-3':
        setState({ isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 3 });
        break;
      case 'physical-5':
        setState({ isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 5 });
        break;
      case 'physical-10':
        setState({ isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 10 });
        break;
      case 'last-day':
        setState({ isTestingMode: true, simulatedForgeMode: 'DURING_FORGE', simulatedDayNumber: 14 });
        break;
      case 'post':
        setState({ isTestingMode: true, simulatedForgeMode: 'POST_FORGE', simulatedDayNumber: null });
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
