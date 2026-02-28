import React, { useState } from 'react';
import { Film, PenTool, Smartphone, Check, RotateCcw, X, Users } from 'lucide-react';
import { useAdminTesting } from '@/contexts/AdminTestingContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/contexts/AuthContext';
import { CohortType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const cohortOptions: { type: CohortType; label: string; shortLabel: string; icon: typeof Film }[] = [
  { type: 'FORGE', label: 'Filmmaking', shortLabel: 'Film', icon: Film },
  { type: 'FORGE_WRITING', label: 'Writing', shortLabel: 'Write', icon: PenTool },
  { type: 'FORGE_CREATORS', label: 'Creators', shortLabel: 'Create', icon: Smartphone },
];

const AdminCohortSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAdminCheck();
  const { simulatedCohortType, setSimulatedCohortType, setSimulatedEditionId, isTestingMode } = useAdminTesting();
  const { edition } = useAuth();
  
  if (!isAdmin) return null;
  
  const actualCohort = edition?.cohort_type as CohortType | undefined;
  const displayedCohort = simulatedCohortType || actualCohort || 'FORGE';
  const isSimulating = simulatedCohortType !== null && simulatedCohortType !== actualCohort;
  
  const currentOption = cohortOptions.find(o => o.type === displayedCohort) || cohortOptions[0];
  const CurrentIcon = currentOption.icon;

  const handleSelect = async (cohort: CohortType) => {
    if (cohort === actualCohort) {
      setSimulatedCohortType(null);
      setSimulatedEditionId(null);
    } else {
      setSimulatedCohortType(cohort);
      // Fetch latest non-archived edition for this cohort
      const { data } = await supabase
        .from('editions')
        .select('id')
        .eq('cohort_type', cohort)
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setSimulatedEditionId(data[0].id);
      }
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
            className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-border bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground">View as Cohort</p>
            </div>
            
            <div className="p-1">
              {cohortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = displayedCohort === option.type;
                const isActual = actualCohort === option.type;
                
                return (
                  <button
                    key={option.type}
                    onClick={() => handleSelect(option.type)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-sm font-medium">{option.label}</span>
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                    {isActual && !isActive && (
                      <span className="text-[10px] text-muted-foreground">yours</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {isSimulating && (
              <div className="p-2 border-t border-border">
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
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all",
          "bg-card border border-border hover:border-primary/50",
          isSimulating && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <CurrentIcon className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">{currentOption.shortLabel}</span>
        {isOpen ? (
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

export default AdminCohortSwitcher;
