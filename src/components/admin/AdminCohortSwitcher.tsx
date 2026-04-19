import React, { useState } from 'react';
import { Film, PenTool, Smartphone, Check, RotateCcw, X, Users } from 'lucide-react';
import { useAdminTesting } from '@/contexts/AdminTestingContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/contexts/AuthContext';
import { CohortType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Per-cohort display metadata (label + icon). Unknown cohort_types fall back
// to the Film icon and the raw string.
const cohortMeta: Record<string, { label: string; icon: typeof Film }> = {
  FORGE: { label: 'Filmmaking', icon: Film },
  FORGE_WRITING: { label: 'Writing', icon: PenTool },
  FORGE_CREATORS: { label: 'Creators', icon: Smartphone },
};

type EditionRow = {
  id: string;
  name: string;
  cohort_type: string | null;
  forge_start_date: string | null;
};

const AdminCohortSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAdminCheck();
  const {
    simulatedEditionId,
    setSimulatedCohortType,
    setSimulatedEditionId,
  } = useAdminTesting();
  const { edition } = useAuth();

  // Fetch every non-archived edition so admin can pick any one for simulation.
  const { data: editions = [] } = useQuery({
    queryKey: ['admin-cohort-switcher-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type, forge_start_date')
        .eq('is_archived', false)
        .order('cohort_type', { ascending: true })
        .order('forge_start_date', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []) as EditionRow[];
    },
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  if (!isAdmin) return null;

  const actualCohort = edition?.cohort_type as CohortType | undefined;
  const actualEditionId = edition?.id;
  const displayedEditionId = simulatedEditionId || actualEditionId;
  const isSimulating = !!simulatedEditionId && simulatedEditionId !== actualEditionId;

  const displayedEdition = editions.find(e => e.id === displayedEditionId);
  const displayedCohort = (displayedEdition?.cohort_type as CohortType) || actualCohort || 'FORGE';
  const currentMeta = cohortMeta[displayedCohort] || { label: displayedCohort, icon: Film };
  const CurrentIcon = currentMeta.icon;
  const pillLabel = displayedEdition?.name || currentMeta.label;

  // Group editions by cohort_type for a cleaner menu.
  const grouped = editions.reduce<Record<string, EditionRow[]>>((acc, ed) => {
    const key = ed.cohort_type || 'UNKNOWN';
    (acc[key] ||= []).push(ed);
    return acc;
  }, {});

  const handleSelect = (ed: EditionRow) => {
    if (ed.id === actualEditionId) {
      // Clicking your own edition -> reset to real view
      setSimulatedCohortType(null);
      setSimulatedEditionId(null);
    } else {
      setSimulatedCohortType(ed.cohort_type as CohortType);
      setSimulatedEditionId(ed.id); // auto-enables isTestingMode
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setSimulatedCohortType(null);
    setSimulatedEditionId(null);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-40 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-72 max-h-[70vh] overflow-auto bg-card border border-border rounded-xl shadow-xl"
          >
            <div className="sticky top-0 z-10 p-3 border-b border-border bg-muted/80 backdrop-blur-sm">
              <p className="text-xs font-medium text-muted-foreground">View as Edition</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                Simulate any cohort's student experience without signing out.
              </p>
            </div>

            <div className="py-1">
              {Object.entries(grouped).map(([cohortKey, eds]) => {
                const meta = cohortMeta[cohortKey] || { label: cohortKey, icon: Film };
                const Icon = meta.icon;
                return (
                  <div key={cohortKey} className="pb-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </div>
                    {eds.map(ed => {
                      const isActive = displayedEditionId === ed.id;
                      const isActual = actualEditionId === ed.id;
                      return (
                        <button
                          key={ed.id}
                          onClick={() => handleSelect(ed)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="flex-1 text-sm truncate">{ed.name}</span>
                          {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
                          {isActual && !isActive && (
                            <span className="text-[10px] text-muted-foreground shrink-0">yours</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {editions.length === 0 && (
                <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                  No active editions.
                </p>
              )}
            </div>

            {isSimulating && (
              <div className="sticky bottom-0 p-2 border-t border-border bg-card">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to My Cohort</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all max-w-[240px]",
          "bg-card border border-border hover:border-primary/50",
          isSimulating && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <CurrentIcon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-medium text-foreground truncate">{pillLabel}</span>
        {isOpen ? (
          <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </button>
    </div>
  );
};

export default AdminCohortSwitcher;
