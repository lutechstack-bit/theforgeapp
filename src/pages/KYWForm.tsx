import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { KYFormProgressBar } from '@/components/kyform/KYFormProgressBar';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { KYFormCompletion } from '@/components/kyform/KYFormCompletion';
import { RadioSelectField } from '@/components/onboarding/RadioSelectField';
import { MultiSelectField } from '@/components/onboarding/MultiSelectField';
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { TermsModal } from '@/components/onboarding/TermsModal';
import { ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
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

const STEP_TITLES = ['General Details', 'Personal Details', 'Writing Practice & Emergency', 'Proficiency', 'Personality & Preferences', 'Understanding You', 'Intent', 'Terms & Conditions'];

const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

const KYWForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [formData, setFormData] = useState({
    certificate_name: '', current_occupation: '',
    age: '', primary_language: '',
    writing_types: [] as string[], emergency_contact_name: '', emergency_contact_number: '',
    proficiency_writing: '', proficiency_story_voice: '',
    top_3_writers_books: '', chronotype: '',
    mbti_type: '', forge_intent: '', forge_intent_other: '', terms_accepted: false,
  });

  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadExistingResponses = async () => {
      if (!user) return;
      const { data } = await supabase.from('kyw_responses').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setFormData({
          certificate_name: data.certificate_name || '',
          current_occupation: data.current_occupation || '',
          age: data.age?.toString() || '',
          primary_language: data.primary_language || '',
          writing_types: data.writing_types || [],
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_number: data.emergency_contact_number || '',
          proficiency_writing: data.proficiency_writing || '',
          proficiency_story_voice: data.proficiency_story_voice || '',
          top_3_writers_books: data.top_3_writers_books?.join(', ') || '',
          chronotype: data.chronotype || '',
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
    try {
      await supabase.from('kyw_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name || null,
        current_occupation: formData.current_occupation || null,
        age: formData.age ? parseInt(formData.age) : null,
        primary_language: formData.primary_language || null,
        writing_types: formData.writing_types.length > 0 ? formData.writing_types : null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_number: formData.emergency_contact_number || null,
        proficiency_writing: formData.proficiency_writing || null,
        proficiency_story_voice: formData.proficiency_story_voice || null,
        top_3_writers_books: formData.top_3_writers_books ? formData.top_3_writers_books.split(',').map(c => c.trim()) : null,
        chronotype: formData.chronotype || null,
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
    await saveProgress();
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from('kyw_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name,
        current_occupation: formData.current_occupation,
        age: formData.age ? parseInt(formData.age) : null,
        primary_language: formData.primary_language,
        writing_types: formData.writing_types,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        proficiency_writing: formData.proficiency_writing,
        proficiency_story_voice: formData.proficiency_story_voice,
        top_3_writers_books: formData.top_3_writers_books.split(',').map(c => c.trim()),
        chronotype: formData.chronotype,
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
      case 0: return !!(formData.certificate_name && formData.current_occupation);
      case 1: return !!(formData.age && formData.primary_language);
      case 2: return formData.writing_types.length > 0 && !!(formData.emergency_contact_name && formData.emergency_contact_number);
      case 3: return !!(formData.proficiency_writing && formData.proficiency_story_voice);
      case 4: return !!(formData.top_3_writers_books && formData.chronotype);
      case 5: return !!formData.mbti_type;
      case 6: return !!(formData.forge_intent && (formData.forge_intent !== 'other' || formData.forge_intent_other));
      case 7: return formData.terms_accepted;
      default: return false;
    }
  };

  if (showCompletion) {
    return <KYFormCompletion cohortType="FORGE_WRITING" />;
  }

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={1} stepTitle="General Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full name (as you want it on your certificate) *</Label>
                <Input value={formData.certificate_name} onChange={e => updateField('certificate_name', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>What are you currently doing? *</Label>
                <Input value={formData.current_occupation} onChange={e => updateField('current_occupation', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 1:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={2} stepTitle="Personal Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Age *</Label>
                <Input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Your Primary Language of Writing *</Label>
                <Input value={formData.primary_language} onChange={e => updateField('primary_language', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 2:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={3} stepTitle="Writing Practice & Emergency">
            <div className="space-y-4">
              <MultiSelectField label="What type of writing do you currently do?" required options={['Fiction', 'Non-fiction', 'Poetry', 'Screenwriting', 'Journaling', 'Not writing consistently yet']} value={formData.writing_types} onChange={v => updateField('writing_types', v)} />
              <div className="space-y-2">
                <Label>Emergency contact name *</Label>
                <Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Emergency contact number *</Label>
                <Input value={formData.emergency_contact_number} onChange={e => updateField('emergency_contact_number', e.target.value)} className="h-11 bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 3:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={4} stepTitle="Proficiency Level">
            <div className="space-y-4">
              <ProficiencyField label="Writing" required options={[{value:'consistent',label:'I write consistently and have finished multiple pieces'},{value:'struggle',label:'I write but struggle to finish'},{value:'shared',label:'I have shared my writing publicly'},{value:'private',label:'I mostly write for myself'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_writing} onChange={v => updateField('proficiency_writing', v)} />
              <ProficiencyField label="Story & Voice" required options={[{value:'clear_voice',label:'I have a clear writing voice'},{value:'experimenting',label:'I experiment with tone and style'},{value:'structure',label:'I struggle with structure'},{value:'confidence',label:'I struggle with confidence'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_story_voice} onChange={v => updateField('proficiency_story_voice', v)} />
            </div>
          </KYFormCard>
        );

      case 4:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={5} stepTitle="Personality & Preferences">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your top 3 writers or books that inspire you? *</Label>
                <Textarea value={formData.top_3_writers_books} onChange={e => updateField('top_3_writers_books', e.target.value)} placeholder="Separate with commas" className="bg-secondary/50" />
              </div>
              <RadioSelectField label="You are" required options={[{value:'early_bird',label:'🌅 An Early bird'},{value:'night_owl',label:'🦉 A Night Owl'}]} value={formData.chronotype} onChange={v => updateField('chronotype', v)} columns={2} />
            </div>
          </KYFormCard>
        );

      case 5:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={6} stepTitle="Understanding You Deeper">
            <div className="space-y-4">
              <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl border border-forge-gold/30 bg-forge-gold/10 hover:bg-forge-gold/20 transition-colors">
                <ExternalLink className="h-5 w-5 text-forge-gold" />
                <span className="text-forge-gold font-medium">Take the personality test</span>
              </a>
              <div className="space-y-2">
                <Label>Your MBTI Result *</Label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {MBTI_TYPES.map(t => <button key={t} onClick={() => updateField('mbti_type', t)} className={`p-2 sm:p-2.5 rounded-lg border text-xs sm:text-sm font-medium tap-scale ${formData.mbti_type === t ? 'border-forge-gold bg-forge-gold/20 text-forge-gold' : 'border-border bg-card'}`}>{t}</button>)}
                </div>
              </div>
            </div>
          </KYFormCard>
        );

      case 6:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={7} stepTitle="Intent at the Forge">
            <div className="space-y-4">
              <RadioSelectField label="What is the one thing you want to unlock as a writer?" required options={[{value:'discipline',label:'Writing discipline'},{value:'finishing',label:'Finishing my work'},{value:'voice',label:'Finding my voice'},{value:'sharing',label:'Sharing my work publicly'},{value:'confidence',label:'Building confidence'},{value:'other',label:'Other'}]} value={formData.forge_intent} onChange={v => updateField('forge_intent', v)} />
              {formData.forge_intent === 'other' && (
                <div className="space-y-2">
                  <Label>If Other, what?</Label>
                  <Input value={formData.forge_intent_other} onChange={e => updateField('forge_intent_other', e.target.value)} className="h-11 bg-secondary/50" />
                </div>
              )}
            </div>
          </KYFormCard>
        );

      case 7:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={8} stepTitle="Terms and Conditions">
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={formData.terms_accepted} onCheckedChange={(c) => updateField('terms_accepted', c === true)} />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-forge-gold underline">terms and conditions</button> of the Forge program.
                </label>
              </div>
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
              Next
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

      <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
    </div>
  );
};

export default KYWForm;
