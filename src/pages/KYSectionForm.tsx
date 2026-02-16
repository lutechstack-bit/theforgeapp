import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getSectionsForCohort, getSectionTotalSteps, calculateAge } from '@/components/kyform/KYSectionConfig';
import type { KYSection } from '@/components/kyform/KYSectionConfig';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { KYSectionIntro } from '@/components/kyform/KYSectionIntro';
import { KYSectionFields } from '@/components/kyform/KYSectionFields';
import { KYFormProgressBar } from '@/components/kyform/KYFormProgressBar';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const KYSectionForm: React.FC = () => {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const navigate = useNavigate();
  const { user, profile, edition, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const cohortType = edition?.cohort_type || 'FORGE';
  const sections = useMemo(() => getSectionsForCohort(cohortType), [cohortType]);
  const section = useMemo(() => sections.find(s => s.key === sectionKey), [sections, sectionKey]);
  const sectionIndex = useMemo(() => sections.findIndex(s => s.key === sectionKey), [sections, sectionKey]);
  const isLastSection = sectionIndex === sections.length - 1;

  const totalSteps = section ? getSectionTotalSteps(section) : 0;

  // Load existing data
  useEffect(() => {
    if (!section || !user || dataLoaded) return;

    const loadData = async () => {
      const { data } = await supabase
        .from(section.responseTable)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const mapped: Record<string, any> = {};
        section.steps.forEach((step) => {
          step.fields.forEach((field) => {
            if (field.type === 'proficiency-grid' && field.skills) {
              field.skills.forEach((skill) => {
                mapped[skill.key] = (data as any)[skill.key] ?? '';
              });
            } else {
              const rawVal = (data as any)[field.key];
              if (field.key === 'has_editing_laptop') {
                mapped[field.key] = rawVal === true ? 'yes' : rawVal === false ? 'no' : '';
              } else if (field.type === 'multi-select' || field.type === 'tags') {
                mapped[field.key] = rawVal || [];
              } else {
                mapped[field.key] = rawVal ?? '';
              }
            }
          });
        });
        setFormData(mapped);
      }
      setDataLoaded(true);
    };

    loadData();
  }, [section, user, dataLoaded]);

  // Reset on section change
  useEffect(() => {
    setCurrentStep(0);
    setDataLoaded(false);
    setFormData({});
  }, [sectionKey]);

  const updateField = useCallback((key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const buildUpsertPayload = useCallback(() => {
    if (!user || !section) return null;
    const payload: Record<string, any> = { user_id: user.id };

    section.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (field.type === 'proficiency-grid' && field.skills) {
          field.skills.forEach((skill) => {
            payload[skill.key] = formData[skill.key] || null;
          });
        } else {
          const val = formData[field.key];
          if (field.key === 'has_editing_laptop') {
            payload[field.key] = val === 'yes' ? true : val === 'no' ? false : null;
          } else if (field.key === 'terms_accepted') {
            payload[field.key] = !!val;
            if (val) payload['terms_accepted_at'] = new Date().toISOString();
          } else if (field.type === 'multi-select' || field.type === 'tags') {
            payload[field.key] = (val && val.length > 0) ? val : null;
          } else if (field.key === 'date_of_birth') {
            payload[field.key] = val || null;
            payload['age'] = calculateAge(val);
          } else {
            payload[field.key] = val || null;
          }
        }
      });
    });

    return payload;
  }, [user, section, formData]);

  const saveProgress = useCallback(async () => {
    if (!section) return;
    const payload = buildUpsertPayload();
    if (!payload) return;
    try {
      await supabase.from(section.responseTable).upsert(payload as any, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Error saving section progress:', e);
    }
  }, [section, buildUpsertPayload]);

  const handleComplete = async () => {
    if (!user || !section) return;
    setLoading(true);

    try {
      const payload = buildUpsertPayload();
      if (payload) {
        const { error } = await supabase.from(section.responseTable).upsert(payload as any, { onConflict: 'user_id' });
        if (error) throw error;
      }

      // Update section progress
      const { data: profileData } = await supabase
        .from('profiles')
        .select('ky_section_progress')
        .eq('id', user.id)
        .maybeSingle();

      const currentProgress = (profileData?.ky_section_progress as Record<string, boolean>) || {};
      const newProgress = { ...currentProgress, [section.key]: true };

      const updatePayload: Record<string, any> = {
        ky_section_progress: newProgress,
      };

      if (isLastSection) {
        updatePayload.ky_form_completed = true;
        updatePayload.kyf_completed = true;
      }

      if (formData.headshot_front_url) {
        updatePayload.avatar_url = formData.headshot_front_url;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();

      toast({
        title: isLastSection ? '🎉 All sections complete!' : '✅ Section completed!',
        description: isLastSection
          ? 'Your KY Form is now fully submitted.'
          : `${section.title} has been saved.`,
      });

      navigate('/', { replace: true });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep > 0) await saveProgress();
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      setExitDialogOpen(true);
    }
  };

  const handleExit = async () => {
    if (currentStep > 0) await saveProgress();
    navigate('/', { replace: true });
  };

  const canProceed = (): boolean => {
    if (currentStep === 0) return true;
    if (!section) return false;
    const stepDef = section.steps[currentStep - 1];
    if (!stepDef) return true;
    return stepDef.fields
      .filter((f) => f.required)
      .every((f) => {
        const val = formData[f.key];
        if (f.type === 'multi-select' || f.type === 'tags') return val && val.length > 0;
        if (f.type === 'checkbox') return !!val;
        return !!val;
      });
  };

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Section not found.</p>
      </div>
    );
  }

  const isIntro = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Calculate question number across all steps
  let questionNumber = 0;
  if (!isIntro) {
    for (let i = 0; i < currentStep - 1; i++) {
      questionNumber += section.steps[i]?.fields.length || 0;
    }
    questionNumber += 1; // Current step starts at this number
  }

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden">
      {/* Ambient gold glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-forge-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-forge-orange/5 blur-[120px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={handleBack}
          className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:border-forge-gold/30 hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-xs text-forge-gold font-semibold">{section.title}</p>
          <p className="text-sm font-bold text-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <button
          onClick={() => setExitDialogOpen(true)}
          className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:border-forge-gold/30 hover:bg-secondary/80 transition-all"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-6 pb-4">
        <KYFormProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />
      </div>

      {/* Card stack area */}
      <div className="relative z-10 flex-1 px-4 pb-32 max-w-lg mx-auto">
        <KYFormCardStack currentStep={currentStep} totalSteps={totalSteps}>
          {/* Intro card */}
          <KYFormCard>
            <KYSectionIntro section={section} />
          </KYFormCard>

          {/* Step cards */}
          {section.steps.map((step, idx) => (
            <KYFormCard
              key={step.key}
              questionNumber={(() => {
                let q = 0;
                for (let i = 0; i < idx; i++) {
                  q += section.steps[i].fields.length;
                }
                return q + 1;
              })()}
              stepTitle={step.title}
            >
              <KYSectionFields
                step={step}
                formData={formData}
                updateField={updateField}
              />
            </KYFormCard>
          ))}
        </KYFormCardStack>
      </div>

      {/* Sticky bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-6 px-4 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className={cn(
                'flex-1 h-12 rounded-full text-sm font-bold transition-all',
                'border border-forge-gold/20 bg-card/80 text-foreground',
                'hover:bg-secondary/80 hover:border-forge-gold/40 active:scale-[0.97]'
              )}
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={cn(
              'flex-1 h-12 rounded-full text-sm font-bold transition-all',
              'bg-gradient-to-r from-forge-gold to-forge-orange text-background',
              'hover:brightness-110 active:scale-[0.97]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'shadow-[0_4px_24px_-4px_hsl(var(--forge-gold)/0.4)]',
              currentStep === 0 && 'flex-[2]'
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : isIntro ? (
              "Let's go →"
            ) : isLastStep ? (
              'Complete ✓'
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>

      {/* Exit dialog */}
      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Save & Leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. You can continue from where you left off anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit} className="rounded-full bg-forge-orange hover:bg-forge-orange/90">
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYSectionForm;
