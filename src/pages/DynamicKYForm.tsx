import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KYFormProgress } from '@/components/onboarding/KYFormProgress';
import { KYFormNavigation } from '@/components/onboarding/KYFormNavigation';
import { DynamicFormField, FormFieldConfig } from '@/components/onboarding/DynamicFormField';
import { Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  fields: FormFieldConfig[];
}

interface FormData {
  id: string;
  name: string;
  cohort_type: string;
  steps: FormStep[];
}

const DynamicKYForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const navigate = useNavigate();
  const { user, profile, edition, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchForm = async () => {
      if (!edition?.cohort_type) {
        setLoading(false);
        return;
      }

      // Fetch form definition
      const { data: form, error: formError } = await supabase
        .from('ky_forms')
        .select('*')
        .eq('cohort_type', edition.cohort_type)
        .eq('is_active', true)
        .single();

      if (formError || !form) {
        console.error('Error fetching form:', formError);
        toast({
          title: 'Form not found',
          description: 'No form configured for your cohort. Please contact support.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Fetch steps
      const { data: steps, error: stepsError } = await supabase
        .from('ky_form_steps')
        .select('*')
        .eq('form_id', form.id)
        .order('order_index');

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        setLoading(false);
        return;
      }

      // Fetch fields for each step
      const stepsWithFields: FormStep[] = await Promise.all(
        (steps || []).map(async (s) => {
          const { data: fields } = await supabase
            .from('ky_form_fields')
            .select('*')
            .eq('step_id', s.id)
            .order('order_index');

          return {
            id: s.id,
            title: s.title,
            description: s.description,
            icon: s.icon,
            order_index: s.order_index,
            fields: (fields || []).map((f) => ({
              id: f.id,
              field_key: f.field_key,
              label: f.label,
              field_type: f.field_type,
              placeholder: f.placeholder || undefined,
              helper_text: f.helper_text || undefined,
              is_required: f.is_required,
              options: Array.isArray(f.options) ? (f.options as { value: string; label: string }[]) : [],
              grid_cols: f.grid_cols || 1,
            })),
          };
        })
      );

      setFormData({
        id: form.id,
        name: form.name,
        cohort_type: form.cohort_type,
        steps: stepsWithFields,
      });

      // Load existing responses if any
      const { data: existingResponses } = await supabase
        .from('ky_dynamic_responses')
        .select('responses')
        .eq('user_id', user?.id)
        .single();

      if (existingResponses?.responses) {
        setResponses(existingResponses.responses as Record<string, any>);
      }

      setLoading(false);
    };

    fetchForm();
  }, [edition?.cohort_type, user?.id]);

  const updateResponse = (fieldKey: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const canProceed = (): boolean => {
    if (!formData) return false;
    const currentStep = formData.steps[step];
    if (!currentStep) return false;

    return currentStep.fields
      .filter((f) => f.is_required)
      .every((f) => {
        const value = responses[f.field_key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== '';
      });
  };

  const handleSubmit = async () => {
    if (!user || !formData) return;
    setSubmitting(true);

    try {
      // Upsert response
      const { error: responseError } = await supabase
        .from('ky_dynamic_responses')
        .upsert({
          user_id: user.id,
          form_id: formData.id,
          responses,
          terms_accepted: responses.terms_accepted === true,
          terms_accepted_at: responses.terms_accepted ? new Date().toISOString() : null,
        }, { onConflict: 'user_id' });

      if (responseError) throw responseError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ky_form_completed: true, kyf_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      toast({ title: 'Welcome to the Forge!', description: 'Your form has been submitted successfully.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!formData || formData.steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No form configured for your cohort.</p>
          <button onClick={() => navigate('/')} className="text-primary underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentStep = formData.steps[step];
  const IconComponent = (Icons as any)[currentStep.icon] || Icons.User;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-6 bg-background">
      <div className="relative w-full max-w-lg">
        <KYFormProgress
          currentStep={step}
          totalSteps={formData.steps.length}
          stepTitles={formData.steps.map((s) => s.title)}
        />

        <div className="mt-8 mb-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <IconComponent className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
              {currentStep.description && (
                <p className="text-muted-foreground">{currentStep.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {currentStep.fields.map((field) => (
                <div
                  key={field.id}
                  className={field.grid_cols === 2 ? 'col-span-1' : ''}
                >
                  <DynamicFormField
                    field={field}
                    value={responses[field.field_key]}
                    onChange={(value) => updateResponse(field.field_key, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <KYFormNavigation
          currentStep={step}
          totalSteps={formData.steps.length}
          canProceed={canProceed()}
          loading={submitting}
          onBack={() => setStep((s) => s - 1)}
          onNext={() => setStep((s) => s + 1)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default DynamicKYForm;
