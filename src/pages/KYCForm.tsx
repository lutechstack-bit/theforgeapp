import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { KYFormCompletion } from '@/components/kyform/KYFormCompletion';
import { RadioSelectField } from '@/components/onboarding/RadioSelectField';
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { CountryStateSelector } from '@/components/onboarding/CountryStateSelector';
import { PhoneInput } from '@/components/onboarding/PhoneInput';
import { TagInput } from '@/components/onboarding/TagInput';
import { TermsModal } from '@/components/onboarding/TermsModal';
import { ChevronLeft, ChevronRight, Loader2, ExternalLink, Clock } from 'lucide-react';
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

const STEP_TITLES = [
  'Introduction',
  'General Details', 
  'Personal Details', 
  'Creator Setup & Emergency', 
  'Proficiency', 
  'Personality & Preferences', 
  'Understanding You', 
  'Intent', 
  'Terms & Conditions'
];

const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const KYCForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [formData, setFormData] = useState({
    certificate_name: '', 
    current_status: '', 
    instagram_id: '',
    date_of_birth: '', 
    state: '', 
    country: '',
    primary_platform: '', 
    emergency_contact_name: '', 
    emergency_contact_number: '',
    proficiency_content_creation: '', 
    proficiency_storytelling: '', 
    proficiency_video_production: '',
    top_3_creators: [] as string[], 
    chronotype: '', 
    meal_preference: '',
    mbti_type: '', 
    forge_intent: '', 
    forge_intent_other: '', 
    terms_accepted: false,
  });

  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadExistingResponses = async () => {
      if (!user) return;
      const { data } = await supabase.from('kyc_responses').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setFormData({
          certificate_name: data.certificate_name || '',
          current_status: data.current_status || '',
          instagram_id: data.instagram_id || '',
          date_of_birth: data.date_of_birth || '',
          state: data.state || '',
          country: data.country || 'India',
          primary_platform: data.primary_platform || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_number: data.emergency_contact_number || '',
          proficiency_content_creation: data.proficiency_content_creation || '',
          proficiency_storytelling: data.proficiency_storytelling || '',
          proficiency_video_production: data.proficiency_video_production || '',
          top_3_creators: data.top_3_creators || [],
          chronotype: data.chronotype || '',
          meal_preference: data.meal_preference || '',
          mbti_type: data.mbti_type || '',
          forge_intent: data.forge_intent || '',
          forge_intent_other: data.forge_intent_other || '',
          terms_accepted: data.terms_accepted || false,
        });
      }
    };
    loadExistingResponses();
  }, [user]);

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const saveProgress = async () => {
    if (!user) return;
    const calculatedAge = calculateAge(formData.date_of_birth);
    try {
      await supabase.from('kyc_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name || null,
        current_status: formData.current_status || null,
        instagram_id: formData.instagram_id || null,
        age: calculatedAge,
        date_of_birth: formData.date_of_birth || null,
        state: formData.state || null,
        country: formData.country || null,
        primary_platform: formData.primary_platform || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_number: formData.emergency_contact_number || null,
        proficiency_content_creation: formData.proficiency_content_creation || null,
        proficiency_storytelling: formData.proficiency_storytelling || null,
        proficiency_video_production: formData.proficiency_video_production || null,
        top_3_creators: formData.top_3_creators.length > 0 ? formData.top_3_creators : null,
        chronotype: formData.chronotype || null,
        meal_preference: formData.meal_preference || null,
        mbti_type: formData.mbti_type || null,
        forge_intent: formData.forge_intent || null,
        forge_intent_other: formData.forge_intent_other || null,
      }, { onConflict: 'user_id' });
    } catch (error: any) {
      console.error('Error saving progress:', error);
    }
  };

  const handleBack = () => {
    if (step === 0) setShowExitDialog(true);
    else setStep(s => s - 1);
  };

  const handleExitWithSave = async () => {
    await saveProgress();
    toast({ title: 'Progress saved', description: 'You can continue later.' });
    navigate('/');
  };

  const handleNext = async () => {
    if (step > 0) await saveProgress();
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const calculatedAge = calculateAge(formData.date_of_birth);
    try {
      await supabase.from('kyc_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name,
        current_status: formData.current_status,
        instagram_id: formData.instagram_id,
        age: calculatedAge,
        date_of_birth: formData.date_of_birth || null,
        state: formData.state,
        country: formData.country,
        primary_platform: formData.primary_platform,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        proficiency_content_creation: formData.proficiency_content_creation || null,
        proficiency_storytelling: formData.proficiency_storytelling || null,
        proficiency_video_production: formData.proficiency_video_production || null,
        top_3_creators: formData.top_3_creators,
        chronotype: formData.chronotype,
        meal_preference: formData.meal_preference,
        mbti_type: formData.mbti_type,
        forge_intent: formData.forge_intent,
        forge_intent_other: formData.forge_intent_other,
        terms_accepted: formData.terms_accepted,
        terms_accepted_at: formData.terms_accepted ? new Date().toISOString() : null,
      }, { onConflict: 'user_id' });
      await supabase.from('profiles').update({ ky_form_completed: true, kyf_completed: true }).eq('id', user.id);
      await refreshProfile();
      setShowCompletion(true);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true; // Intro step - always valid
      case 1: return !!(formData.certificate_name && formData.current_status && formData.instagram_id);
      case 2: return !!(formData.date_of_birth && formData.state && formData.country);
      case 3: return !!(formData.primary_platform && formData.emergency_contact_name && formData.emergency_contact_number);
      case 4: return true; // Proficiency optional
      case 5: return !!(formData.top_3_creators.length > 0 && formData.chronotype && formData.meal_preference);
      case 6: return !!formData.mbti_type;
      case 7: return !!(formData.forge_intent && (formData.forge_intent !== 'other' || formData.forge_intent_other));
      case 8: return formData.terms_accepted;
      default: return false;
    }
  };

  if (showCompletion) {
    return <KYFormCompletion cohortType="FORGE_CREATORS" />;
  }

  const calculatedAge = calculateAge(formData.date_of_birth);

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} stepTitle="Know Your Creator">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                This provides basic information about yourself that we at Forge 
                can use to ensure the best experience during Forge.
              </p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Please ensure that you have about 5-10 mins to fill this form</span>
              </div>
              
              <div className="p-4 rounded-xl bg-forge-orange/10 border border-forge-orange/30">
                <p className="text-sm text-forge-orange font-medium">
                  You will need to complete this form to access the Forge app
                </p>
              </div>
            </div>
          </KYFormCard>
        );

      case 1:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={1} stepTitle="General Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full name (as you want it on your certificate) *</Label>
                <Input value={formData.certificate_name} onChange={e => updateField('certificate_name', e.target.value)} placeholder="e.g. Arjun Sharma" className="h-11 bg-secondary/50" />
              </div>
              <RadioSelectField label="What best describes you right now?" required options={[{value:'student',label:'Student'},{value:'working',label:'Working Professional'},{value:'freelancer',label:'Freelancer'},{value:'creator',label:'Full-time Creator'},{value:'founder',label:'Founder / Entrepreneur'}]} value={formData.current_status} onChange={v => updateField('current_status', v)} />
              <div className="space-y-2">
                <Label>Your Instagram ID *</Label>
                <Input value={formData.instagram_id} onChange={e => updateField('instagram_id', e.target.value)} placeholder="@yourhandle" className="h-11 bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 2:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={2} stepTitle="Personal Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className="h-11 bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <div className="h-11 px-3 rounded-md border border-input bg-secondary/30 flex items-center text-muted-foreground">
                    {calculatedAge !== null ? `${calculatedAge} years` : '—'}
                  </div>
                </div>
              </div>
              <CountryStateSelector
                country={formData.country}
                state={formData.state}
                onCountryChange={(c) => {
                  updateField('country', c);
                  updateField('state', '');
                }}
                onStateChange={(s) => updateField('state', s)}
                required
              />
            </div>
          </KYFormCard>
        );

      case 3:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={3} stepTitle="Creator Setup & Emergency">
            <div className="space-y-4">
              <RadioSelectField label="Your primary content platform" required options={[{value:'instagram',label:'Instagram'},{value:'youtube',label:'YouTube'},{value:'linkedin',label:'LinkedIn'},{value:'podcast',label:'Podcast'},{value:'multiple',label:'Multiple Platforms'},{value:'not_started',label:'Not started yet'}]} value={formData.primary_platform} onChange={v => updateField('primary_platform', v)} />
              <div className="space-y-2">
                <Label>Emergency contact name *</Label>
                <Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} placeholder="e.g. Parent or Guardian name" className="h-11 bg-secondary/50" />
              </div>
              <PhoneInput
                label="Emergency contact number"
                value={formData.emergency_contact_number}
                onChange={(value) => updateField('emergency_contact_number', value)}
                required
              />
            </div>
          </KYFormCard>
        );

      case 4:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={4} stepTitle="Proficiency Level">
            <p className="text-sm text-muted-foreground mb-4">Help us understand your experience (optional)</p>
            <div className="space-y-4">
              <ProficiencyField label="Content Creation" options={[{value:'consistent',label:'I consistently post content and track performance'},{value:'inconsistent',label:'I have posted content but not consistently'},{value:'experimenting',label:'I am experimenting with different formats'},{value:'strategy',label:'I understand content strategy and hooks'},{value:'occasional',label:'I only post occasionally'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_content_creation} onChange={v => updateField('proficiency_content_creation', v)} />
              <ProficiencyField label="Storytelling" options={[{value:'structure',label:'I can structure stories with a clear hook and payoff'},{value:'narrative',label:'I understand narrative arcs for content'},{value:'scripts',label:'I can write scripts for short-form videos'},{value:'unstructured',label:'I mostly speak on camera without structure'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_storytelling} onChange={v => updateField('proficiency_storytelling', v)} />
              <ProficiencyField label="Video Production" options={[{value:'professional',label:'I shoot and edit my own content professionally'},{value:'shoot_only',label:'I can shoot but struggle with editing'},{value:'edit_only',label:'I can edit but struggle with shooting'},{value:'mobile',label:'I only use mobile apps'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_video_production} onChange={v => updateField('proficiency_video_production', v)} />
            </div>
          </KYFormCard>
        );

      case 5:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={5} stepTitle="Personality & Preferences">
            <div className="space-y-4">
              <TagInput
                label="Your top 3 creators you enjoy watching?"
                value={formData.top_3_creators}
                onChange={(creators) => updateField('top_3_creators', creators)}
                maxItems={3}
                placeholder="Type a creator and press Enter..."
                required
              />
              <RadioSelectField label="You are" required options={[{value:'early_bird',label:'🌅 An Early bird'},{value:'night_owl',label:'🦉 A Night Owl'}]} value={formData.chronotype} onChange={v => updateField('chronotype', v)} columns={2} />
              <RadioSelectField label="Your Meal preference" required options={[{value:'vegetarian',label:'🌱 Vegetarian'},{value:'non_vegetarian',label:'🟥 Non-Vegetarian'}]} value={formData.meal_preference} onChange={v => updateField('meal_preference', v)} columns={2} />
            </div>
          </KYFormCard>
        );

      case 6:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={6} stepTitle="Understanding You">
            <p className="text-sm text-muted-foreground mb-4">To assign you to compatible groups</p>
            <div className="space-y-4">
              <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl border border-forge-gold/30 bg-forge-gold/10 hover:bg-forge-gold/20 transition-colors">
                <ExternalLink className="h-5 w-5 text-forge-gold" />
                <span className="text-forge-gold font-medium">Take the personality test</span>
              </a>
              
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">What is the personality test?</p>
                <p className="text-xs text-muted-foreground/80">
                  This 16 personalities test combines Myers-Briggs Type Indicator (MBTI) concepts 
                  with Big Five personality traits to classify individuals into 16 distinct types.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Your MBTI Result *</Label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {MBTI_TYPES.map(t => <button key={t} type="button" onClick={() => updateField('mbti_type', t)} className={`p-2 sm:p-2.5 rounded-lg border text-xs sm:text-sm font-medium tap-scale ${formData.mbti_type === t ? 'border-forge-gold bg-forge-gold/20 text-forge-gold' : 'border-border bg-card'}`}>{t}</button>)}
                </div>
              </div>
            </div>
          </KYFormCard>
        );

      case 7:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={7} stepTitle="Intent at the Forge">
            <div className="space-y-4">
              <RadioSelectField label="What is the one thing you really want to build as a creator?" required options={[{value:'brand',label:'My personal brand'},{value:'consistency',label:'Consistency and discipline'},{value:'direction',label:'A strong content direction'},{value:'community',label:'A creator community'},{value:'confidence',label:'Confidence on camera'},{value:'monetisation',label:'Monetisation clarity'},{value:'other',label:'Other'}]} value={formData.forge_intent} onChange={v => updateField('forge_intent', v)} />
              {formData.forge_intent === 'other' && (
                <div className="space-y-2">
                  <Label>If Other, what?</Label>
                  <Input value={formData.forge_intent_other} onChange={e => updateField('forge_intent_other', e.target.value)} placeholder="Please describe your intent" className="h-11 bg-secondary/50" />
                </div>
              )}
            </div>
          </KYFormCard>
        );

      case 8:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={8} stepTitle="Terms and Conditions">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={formData.terms_accepted} onCheckedChange={(c) => updateField('terms_accepted', c === true)} className="mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the terms and conditions of the Forge program.
                    </label>
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-forge-gold underline hover:text-forge-yellow transition-colors text-sm inline-flex items-center gap-1"
                    >
                      Read terms
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <TermsModal open={termsModalOpen} onOpenChange={setTermsModalOpen} />
            </div>
          </KYFormCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center py-4 sm:py-6 px-3 sm:px-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-forge-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-forge-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="mb-6">
          <KYFormCardStack currentStep={step} totalSteps={STEP_TITLES.length}>
            {STEP_TITLES.map((title, index) => (
              <div key={index}>
                {renderStepContent(index)}
              </div>
            ))}
          </KYFormCardStack>
        </div>

        <div className="flex gap-4 items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="text-muted-foreground hover:text-foreground hover:bg-transparent px-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {step < STEP_TITLES.length - 1 ? (
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()} 
              className="bg-foreground text-background rounded-full px-8 hover:bg-foreground/90 font-semibold shadow-lg"
            >
              {step === 0 ? 'Get Started' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!canProceed() || loading} 
              className="bg-forge-yellow text-black rounded-full px-8 hover:bg-forge-gold font-semibold shadow-lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save and leave?</AlertDialogTitle>
            <AlertDialogDescription>Your progress will be saved. You can continue later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue filling</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitWithSave}>Save & Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYCForm;
