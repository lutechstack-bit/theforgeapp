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
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { User, MapPin, Video, Sparkles, FileCheck, ExternalLink } from 'lucide-react';

const STEP_TITLES = ['General Details', 'Personal Details', 'Creator Setup & Emergency', 'Proficiency', 'Personality & Preferences', 'Understanding You', 'Intent', 'Terms & Conditions'];

const KYCForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    certificate_name: '', current_status: '', instagram_id: '',
    age: '', date_of_birth: '', state: '', country: '',
    primary_platform: '', emergency_contact_name: '', emergency_contact_number: '',
    proficiency_content_creation: '', proficiency_storytelling: '', proficiency_video_production: '',
    top_3_creators: '', chronotype: '', meal_preference: '',
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
      await supabase.from('kyc_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name,
        current_status: formData.current_status,
        instagram_id: formData.instagram_id,
        age: formData.age ? parseInt(formData.age) : null,
        date_of_birth: formData.date_of_birth || null,
        state: formData.state,
        country: formData.country,
        primary_platform: formData.primary_platform,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        proficiency_content_creation: formData.proficiency_content_creation,
        proficiency_storytelling: formData.proficiency_storytelling,
        proficiency_video_production: formData.proficiency_video_production,
        top_3_creators: formData.top_3_creators.split(',').map(c => c.trim()),
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
      toast({ title: 'Welcome to the Forge!', description: 'Your KYC form has been submitted.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!(formData.certificate_name && formData.current_status && formData.instagram_id);
      case 1: return !!(formData.age && formData.date_of_birth && formData.state && formData.country);
      case 2: return !!(formData.primary_platform && formData.emergency_contact_name && formData.emergency_contact_number);
      case 3: return !!(formData.proficiency_content_creation && formData.proficiency_storytelling && formData.proficiency_video_production);
      case 4: return !!(formData.top_3_creators && formData.chronotype && formData.meal_preference);
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
          <RadioSelectField label="What best describes you right now?" required options={[{value:'student',label:'Student'},{value:'working',label:'Working Professional'},{value:'freelancer',label:'Freelancer'},{value:'creator',label:'Full-time Creator'},{value:'founder',label:'Founder / Entrepreneur'}]} value={formData.current_status} onChange={v => updateField('current_status', v)} />
          <div className="space-y-2"><Label>Your Instagram ID *</Label><Input value={formData.instagram_id} onChange={e => updateField('instagram_id', e.target.value)} className="h-12 bg-secondary/50" /></div>
        </div>
      </div>,
      <div key={1} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><MapPin className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Personal Details</h2></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Your Age *</Label><Input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} className="h-12 bg-secondary/50" /></div><div className="space-y-2"><Label>Date of Birth *</Label><Input type="date" value={formData.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className="h-12 bg-secondary/50" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>State *</Label><Input value={formData.state} onChange={e => updateField('state', e.target.value)} className="h-12 bg-secondary/50" /></div><div className="space-y-2"><Label>Country *</Label><Input value={formData.country} onChange={e => updateField('country', e.target.value)} className="h-12 bg-secondary/50" /></div></div>
        </div>
      </div>,
      <div key={2} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Video className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Creator Setup & Emergency</h2></div>
        <div className="space-y-4">
          <RadioSelectField label="Your primary content platform" required options={[{value:'instagram',label:'Instagram'},{value:'youtube',label:'YouTube'},{value:'linkedin',label:'LinkedIn'},{value:'podcast',label:'Podcast'},{value:'multiple',label:'Multiple Platforms'},{value:'not_started',label:'Not started yet'}]} value={formData.primary_platform} onChange={v => updateField('primary_platform', v)} />
          <div className="space-y-2"><Label>Emergency contact name *</Label><Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} className="h-12 bg-secondary/50" /></div>
          <div className="space-y-2"><Label>Emergency contact number *</Label><Input value={formData.emergency_contact_number} onChange={e => updateField('emergency_contact_number', e.target.value)} className="h-12 bg-secondary/50" /></div>
        </div>
      </div>,
      <div key={3} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Proficiency Level</h2></div>
        <div className="space-y-6">
          <ProficiencyField label="Content Creation" required options={[{value:'consistent',label:'I consistently post content and track performance'},{value:'inconsistent',label:'I have posted content but not consistently'},{value:'experimenting',label:'I am experimenting with different formats'},{value:'strategy',label:'I understand content strategy and hooks'},{value:'occasional',label:'I only post occasionally'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_content_creation} onChange={v => updateField('proficiency_content_creation', v)} />
          <ProficiencyField label="Storytelling" required options={[{value:'structure',label:'I can structure stories with a clear hook and payoff'},{value:'narrative',label:'I understand narrative arcs for content'},{value:'scripts',label:'I can write scripts for short-form videos'},{value:'unstructured',label:'I mostly speak on camera without structure'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_storytelling} onChange={v => updateField('proficiency_storytelling', v)} />
          <ProficiencyField label="Video Production" required options={[{value:'professional',label:'I shoot and edit my own content professionally'},{value:'shoot_only',label:'I can shoot but struggle with editing'},{value:'edit_only',label:'I can edit but struggle with shooting'},{value:'mobile',label:'I only use mobile apps'},{value:'starting',label:'I am just getting started'}]} value={formData.proficiency_video_production} onChange={v => updateField('proficiency_video_production', v)} />
        </div>
      </div>,
      <div key={4} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Personality & Preferences</h2></div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Your top 3 creators you enjoy watching? *</Label><Textarea value={formData.top_3_creators} onChange={e => updateField('top_3_creators', e.target.value)} placeholder="Separate with commas" className="bg-secondary/50" /></div>
          <RadioSelectField label="You are" required options={[{value:'early_bird',label:'🌅 An Early bird'},{value:'night_owl',label:'🦉 A Night Owl'}]} value={formData.chronotype} onChange={v => updateField('chronotype', v)} columns={2} />
          <RadioSelectField label="Your Meal preference" required options={[{value:'vegetarian',label:'🌱 Vegetarian'},{value:'non_vegetarian',label:'🟥 Non-Vegetarian'}]} value={formData.meal_preference} onChange={v => updateField('meal_preference', v)} columns={2} />
        </div>
      </div>,
      <div key={5} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><Sparkles className="h-7 w-7 text-primary" /></div><h2 className="text-2xl font-bold">Understanding You Deeper</h2></div>
        <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5"><ExternalLink className="h-5 w-5 text-primary" /><span className="text-primary font-medium">Take the personality test</span></a>
        <div className="space-y-2"><Label>Your MBTI Result *</Label><div className="grid grid-cols-4 gap-2">{'ISTJ,ISFJ,INFJ,INTJ,ISTP,ISFP,INFP,INTP,ESTP,ESFP,ENFP,ENTP,ESTJ,ESFJ,ENFJ,ENTJ'.split(',').map(t => <button key={t} onClick={() => updateField('mbti_type', t)} className={`p-3 rounded-lg border text-sm font-medium ${formData.mbti_type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'}`}>{t}</button>)}</div></div>
      </div>,
      <div key={6} className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2"><h2 className="text-2xl font-bold">Intent at the Forge</h2></div>
        <RadioSelectField label="What is the one thing you really want to build as a creator?" required options={[{value:'brand',label:'My personal brand'},{value:'consistency',label:'Consistency and discipline'},{value:'direction',label:'A strong content direction'},{value:'community',label:'A creator community'},{value:'confidence',label:'Confidence on camera'},{value:'monetisation',label:'Monetisation clarity'},{value:'other',label:'Other'}]} value={formData.forge_intent} onChange={v => updateField('forge_intent', v)} />
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

export default KYCForm;
