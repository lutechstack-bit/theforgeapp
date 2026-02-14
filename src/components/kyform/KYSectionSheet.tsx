import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { KYFormProgressBar } from './KYFormProgressBar';
import { KYSectionIntro } from './KYSectionIntro';
import { KYSectionFields } from './KYSectionFields';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KYSection } from './KYSectionConfig';
import { calculateAge, getSectionTotalSteps } from './KYSectionConfig';

interface KYSectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: KYSection;
  onComplete: () => void;
  isLastSection?: boolean;
}

export const KYSectionSheet: React.FC<KYSectionSheetProps> = ({
  open,
  onOpenChange,
  section,
  onComplete,
  isLastSection = false,
}) => {
  const isMobile = useIsMobile();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const totalSteps = getSectionTotalSteps(section);

  // Load existing data when sheet opens
  useEffect(() => {
    if (!open || !user || dataLoaded) return;

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
            const rawVal = (data as any)[field.key];
            if (field.key === 'has_editing_laptop') {
              mapped[field.key] = rawVal === true ? 'yes' : rawVal === false ? 'no' : '';
            } else if (field.type === 'multi-select' || field.type === 'tags') {
              mapped[field.key] = rawVal || [];
            } else {
              mapped[field.key] = rawVal ?? '';
            }
          });
        });
        setFormData(mapped);
      }
      setDataLoaded(true);
    };

    loadData();
  }, [open, user, section, dataLoaded]);

  // Reset when section changes
  useEffect(() => {
    setCurrentStep(0);
    setDataLoaded(false);
    setFormData({});
  }, [section.key]);

  const updateField = useCallback((key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const buildUpsertPayload = () => {
    if (!user) return null;
    const payload: Record<string, any> = { user_id: user.id };

    section.steps.forEach((step) => {
      step.fields.forEach((field) => {
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
      });
    });

    return payload;
  };

  const saveProgress = async () => {
    const payload = buildUpsertPayload();
    if (!payload) return;
    try {
      await supabase.from(section.responseTable).upsert(payload as any, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Error saving section progress:', e);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save form data
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

      // If last section, mark KY form as complete
      if (isLastSection) {
        updatePayload.ky_form_completed = true;
        updatePayload.kyf_completed = true;
      }

      // Auto-set avatar from headshot if available
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

      onComplete();
      onOpenChange(false);
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
      onOpenChange(false);
    }
  };

  const handleClose = async () => {
    if (currentStep > 0) await saveProgress();
    onOpenChange(false);
  };

  // Check if current step is valid
  const canProceed = (): boolean => {
    if (currentStep === 0) return true; // Intro
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

  const isIntro = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const buttonText = isIntro
    ? "Let's go →"
    : isLastStep
    ? 'Complete ✓'
    : 'Next →';

  const content = (
    <div className="flex flex-col h-full max-h-[90dvh] md:max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">{section.title}</p>
          <p className="text-sm font-bold text-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <button onClick={handleClose} className="p-2 -mr-2 rounded-xl hover:bg-secondary/80 transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3 shrink-0">
        <KYFormProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="rounded-2xl border border-forge-gold/20 bg-card/80 backdrop-blur-sm p-5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]">
          {isIntro ? (
            <KYSectionIntro section={section} />
          ) : (
            <KYSectionFields
              step={section.steps[currentStep - 1]}
              formData={formData}
              updateField={updateField}
            />
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="px-4 pb-5 pt-2 shrink-0 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className={cn(
            'w-full py-3.5 rounded-full text-sm font-bold transition-all',
            'bg-forge-orange text-foreground',
            'hover:brightness-110 active:scale-[0.98]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'shadow-[0_4px_20px_-4px_hsl(var(--forge-orange)/0.4)]'
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            buttonText
          )}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95dvh] max-h-[95dvh] bg-background border-t border-border">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-background border border-border rounded-2xl overflow-hidden max-h-[90vh]">
        {content}
      </DialogContent>
    </Dialog>
  );
};
