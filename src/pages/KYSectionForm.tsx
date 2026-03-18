import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getSectionsForCohort, getRequiredSections, getSectionTotalSteps, calculateAge } from '@/components/kyform/KYSectionConfig';
import type { KYSection } from '@/components/kyform/KYSectionConfig';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { KYSectionIntro } from '@/components/kyform/KYSectionIntro';
import { KYSectionFields } from '@/components/kyform/KYSectionFields';
import { CommunityProfileStep1, CommunityProfileStep2, CommunityProfileStep3 } from '@/components/community/CommunityProfileSteps';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
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
  const { user, profile, refreshProfile } = useAuth();
  const { effectiveCohortType } = useEffectiveCohort();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const cohortType = effectiveCohortType || 'FORGE';
  const sections = useMemo(() => getSectionsForCohort(cohortType), [cohortType]);
  const requiredSections = useMemo(() => getRequiredSections(cohortType), [cohortType]);
  const section = useMemo(() => sections.find(s => s.key === sectionKey), [sections, sectionKey]);
  const sectionIndex = useMemo(() => sections.findIndex(s => s.key === sectionKey), [sections, sectionKey]);
  const isCommunityProfile = section?.key === 'community_profile';
  const isLastRequiredSection = sectionIndex === requiredSections.length - 1;

  const totalSteps = section ? getSectionTotalSteps(section) : 0;

  // Load existing data
  useEffect(() => {
    if (!section || !user || dataLoaded) return;

    const loadData = async () => {
      if (isCommunityProfile) {
        // Load from collaborator_profiles
        const { data } = await supabase
          .from('collaborator_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setFormData({
            tagline: data.tagline || '',
            about: data.about || '',
            intro: data.intro || '',
            occupations: data.occupations || [],
            open_to_remote: data.open_to_remote || false,
            available_for_hire: data.available_for_hire || false,
            portfolio_url: data.portfolio_url || '',
            portfolio_type: data.portfolio_type || 'Portfolio',
          });
        }
      } else {
        const { data } = await supabase
          .from(section.responseTable as 'kyf_responses' | 'kyc_responses' | 'kyw_responses')
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
      }
      setDataLoaded(true);
    };

    loadData();
  }, [section, user, dataLoaded, isCommunityProfile]);

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

    if (isCommunityProfile) {
      return {
        user_id: user.id,
        tagline: (formData.tagline || '').trim() || null,
        about: (formData.about || '').trim() || null,
        intro: (formData.intro || '').trim() || null,
        occupations: formData.occupations || [],
        open_to_remote: formData.open_to_remote || false,
        available_for_hire: formData.available_for_hire || false,
        portfolio_url: (formData.portfolio_url || '').trim() || null,
        portfolio_type: formData.portfolio_type || null,
        is_published: true,
      };
    }

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
  }, [user, section, formData, isCommunityProfile]);

  const saveProgress = useCallback(async () => {
    if (!section) return;
    const payload = buildUpsertPayload();
    if (!payload) return;
    try {
      if (isCommunityProfile) {
        await supabase.from('collaborator_profiles').upsert(payload as any, { onConflict: 'user_id' });
      } else {
        await supabase.from(section.responseTable as 'kyf_responses' | 'kyc_responses' | 'kyw_responses').upsert(payload as any, { onConflict: 'user_id' });
      }
    } catch (e) {
      console.error('Error saving section progress:', e);
    }
  }, [section, buildUpsertPayload, isCommunityProfile]);

  const handleComplete = async () => {
    if (!user || !section) return;
    setLoading(true);

    try {
      const payload = buildUpsertPayload();
      if (payload) {
        if (isCommunityProfile) {
          const { error } = await supabase.from('collaborator_profiles').upsert(payload as any, { onConflict: 'user_id' });
          if (error) throw error;
        } else {
          const { error } = await supabase.from(section.responseTable as 'kyf_responses' | 'kyc_responses' | 'kyw_responses').upsert(payload as any, { onConflict: 'user_id' });
          if (error) throw error;
        }
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

      // Only set ky_form_completed when the last *required* section is done
      if (isLastRequiredSection) {
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

      if (isCommunityProfile) {
        queryClient.invalidateQueries({ queryKey: ['creatives-directory'] });
        queryClient.invalidateQueries({ queryKey: ['has-collaborator-profile'] });
        toast({
          title: '✨ Creative profile published!',
          description: "You're now visible in the creative network.",
        });
      } else {
        toast({
          title: isLastRequiredSection ? '🎉 All sections complete!' : '✅ Section completed!',
          description: isLastRequiredSection
            ? 'Your KY Form is now fully submitted.'
            : `${section.title} has been saved.`,
        });
      }

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

    if (isCommunityProfile) {
      const stepIdx = currentStep - 1;
      if (stepIdx === 0) return (formData.tagline || '').trim().length > 0;
      if (stepIdx === 1) return (formData.occupations || []).length > 0;
      return true;
    }

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

  const renderCommunityStep = (stepIdx: number) => {
    const props = { formData, updateField };
    switch (stepIdx) {
      case 0: return <CommunityProfileStep1 {...props} />;
      case 1: return <CommunityProfileStep2 {...props} />;
      case 2: return <CommunityProfileStep3 {...props} />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Ambient gold glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-forge-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-forge-orange/5 blur-[120px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-2 pb-1">
        <button
          onClick={handleBack}
          className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:border-forge-gold/30 hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{section.title}</p>
        </div>
        <button
          onClick={() => setExitDialogOpen(true)}
          className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:border-forge-gold/30 hover:bg-secondary/80 transition-all"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Card stack area */}
      <div className="relative z-10 flex-1 flex items-center px-4 pb-20 max-w-xl mx-auto w-full min-h-0">
        <KYFormCardStack currentStep={currentStep} totalSteps={totalSteps}>
          {/* Intro card */}
          <KYFormCard currentStep={currentStep + 1} totalSteps={totalSteps}>
            <KYSectionIntro section={section} />
          </KYFormCard>

          {/* Step cards */}
          {section.steps.map((step, idx) => (
            <KYFormCard key={step.key} currentStep={currentStep + 1} totalSteps={totalSteps}>
              {isCommunityProfile ? (
                renderCommunityStep(idx)
              ) : (
                <KYSectionFields
                  step={step}
                  formData={formData}
                  updateField={updateField}
                />
              )}
            </KYFormCard>
          ))}
        </KYFormCardStack>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-3 pb-4 px-4 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97] px-3"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={cn(
              'h-11 px-10 rounded-full text-sm font-bold transition-all',
              'bg-[#FCF7EF] text-[#1a1a1a]',
              'hover:bg-[#f5eddf] active:scale-[0.97]',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : isIntro ? (
              "Let's go →"
            ) : isLastStep ? (
              isCommunityProfile ? 'Publish ✓' : 'Complete ✓'
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
