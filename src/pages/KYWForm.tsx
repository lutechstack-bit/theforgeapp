import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { KYFormProgress } from '@/components/onboarding/KYFormProgress';
import { KYFormNavigation } from '@/components/onboarding/KYFormNavigation';
import { RadioSelectField } from '@/components/onboarding/RadioSelectField';
import { MultiSelectField } from '@/components/onboarding/MultiSelectField';
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { User, MapPin, Pen, Sparkles, FileCheck, ExternalLink } from 'lucide-react';

const STEP_TITLES = ['General Details', 'Personal Details', 'Writing Practice & Emergency', 'Proficiency', 'Personality & Preferences', 'Understanding You', 'Intent', 'Terms & Conditions'];

const KYWForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

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
      toast({ title: 'Welcome to the Forge!', description: 'Your KYW form has been submitted.' });
      navigate('/');
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

  const renderStep = () => {
    const steps = [
      <div key={0} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><User className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">General Details</h2></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Full name (as you want it on your certificate) *</Label><Input value={formData.certificate_name} onChange={e => updateField('certificate_name', e.target.value)} className="h-12 bg-secondary/50" /></div>
          <div className="space-y-2"><Label>What are you currently doing? *</Label><Input value={formData.current_occupation} onChange={e => updateField('current_occupation', e.target.value)} className="h-12 bg-secondary/50" /></div>
        </div>
      </div>,
      <div key={1} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><MapPin className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Personal Details</h2></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Your Age *</Label><Input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} className="h-12 bg-secondary/50" /></div>
          <div className="space-y-2"><Label>Your Primary Language of Writing *</Label><Input value={formData.primary_language} onChange={e => updateField('primary_language', e.target.value)} className="h-12 bg-secondary/50" /></div>
        </div>
      </div>,
      <div key={2} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Pen className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Writing Practice & Emergency</h2></div>
        <div className="space-y-4">
          <MultiSelectField label="What type of writing do you currently do?" required options={['Fiction', 'Non-fiction', 'Poetry', 'Screenwriting', 'Journaling', 'Not writing consistently yet']} value={formData.writing_types} onChange={v => updateField('writing_types', v)} />
          <div className="space-y-2"><Label>Emergency contact name *</Label><Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} className="h-12 bg-secondary/50" /></div>
          <div className="space-y-2"><Label>Emergency contact number *</Label><Input value={formData.emergency_contact_number} onChange={e => updateField('emergency_contact_number', e.target.value)} className="h-12 bg-secondary/50" /></div>
        </div>
      </div>,
      <div key={3} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Proficiency Level</h2></div>
        <div className="space-y-6">
          <ProficiencyField label="Writing" required options={[{value:'consistent',label:'I write consistently and have finished multiple pieces'},{value:'struggle',label:'I write but struggle to finish'},{value:'shared',label:'I have shared my writing publicly'},{value:'private',label:'I mostly write for myself'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_writing} onChange={v => updateField('proficiency_writing', v)} />
          <ProficiencyField label="Story & Voice" required options={[{value:'clear_voice',label:'I have a clear writing voice'},{value:'experimenting',label:'I experiment with tone and style'},{value:'structure',label:'I struggle with structure'},{value:'confidence',label:'I struggle with confidence'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_story_voice} onChange={v => updateField('proficiency_story_voice', v)} />
        </div>
      </div>,
      <div key={4} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Personality & Preferences</h2></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Your top 3 writers or books that inspire you? *</Label><Textarea value={formData.top_3_writers_books} onChange={e => updateField('top_3_writers_books', e.target.value)} placeholder="Separate with commas" className="bg-secondary/50" /></div>
          <RadioSelectField label="You are" required options={[{value:'early_bird',label:'🌅 An Early bird'},{value:'night_owl',label:'🦉 A Night Owl'}]} value={formData.chronotype} onChange={v => updateField('chronotype', v)} columns={2} />
        </div>
      </div>,
      <div key={5} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Understanding You Deeper</h2></div>
        <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5"><ExternalLink className="h-5 w-5 text-primary" /><span className="text-primary font-medium">Take the personality test</span></a>
        <div className="space-y-2"><Label>Your MBTI Result *</Label><div className="grid grid-cols-4 gap-2">{'ISTJ,ISFJ,INFJ,INTJ,ISTP,ISFP,INFP,INTP,ESTP,ESFP,ENFP,ENTP,ESTJ,ESFJ,ENFJ,ENTJ'.split(',').map(t => <button key={t} onClick={() => updateField('mbti_type', t)} className={`p-3 rounded-lg border text-sm font-medium ${formData.mbti_type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}>{t}</button>)}</div></div>
      </div>,
      <div key={6} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><h2 className="text-2xl font-bold">Intent at the Forge</h2></div>
        <RadioSelectField label="What is the one thing you want to unlock as a writer?" required options={[{value:'discipline',label:'Writing discipline'},{value:'finishing',label:'Finishing my work'},{value:'voice',label:'Finding my voice'},{value:'sharing',label:'Sharing my work publicly'},{value:'confidence',label:'Building confidence'},{value:'other',label:'Other'}]} value={formData.forge_intent} onChange={v => updateField('forge_intent', v)} />
        {formData.forge_intent === 'other' && <div className="space-y-2"><Label>If Other, what?</Label><Input value={formData.forge_intent_other} onChange={e => updateField('forge_intent_other', e.target.value)} className="h-12 bg-secondary/50" /></div>}
      </div>,
      <div key={7} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><FileCheck className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Terms and Conditions</h2></div>
        <div className="p-4 rounded-xl border border-border bg-card"><div className="flex items-start gap-3"><Checkbox id="terms" checked={formData.terms_accepted} onCheckedChange={(c) => updateField('terms_accepted', c === true)} /><label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">I agree to the <a href="#" className="text-primary underline">terms and conditions</a> of the Forge program.</label></div></div>
      </div>,
    ];
    return steps[step];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-6 bg-background">
      <div className="relative w-full max-w-lg">
        <KYFormProgress currentStep={step} totalSteps={STEP_TITLES.length} stepTitles={STEP_TITLES} />
        <div className="mt-8 mb-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">{renderStep()}</div>
        <KYFormNavigation currentStep={step} totalSteps={STEP_TITLES.length} canProceed={canProceed()} loading={loading} onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default KYWForm;
