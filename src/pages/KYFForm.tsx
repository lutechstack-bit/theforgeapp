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
import { ScrollArea } from '@/components/ui/scroll-area';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { KYFormCompletion } from '@/components/kyform/KYFormCompletion';
import { RadioSelectField } from '@/components/onboarding/RadioSelectField';
import { MultiSelectField } from '@/components/onboarding/MultiSelectField';
import { ProficiencyField } from '@/components/onboarding/ProficiencyField';
import { PhotoUploadField } from '@/components/onboarding/PhotoUploadField';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Loader2, ExternalLink, Clock, ChevronDown } from 'lucide-react';
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
  'Preferences & Emergency',
  'Proficiency',
  'Personality & Preferences',
  'Casting Call',
  'Your Pictures',
  'Understanding You',
  'Terms & Conditions',
];

const SCREENWRITING_OPTIONS = [
  { value: 'pitched_script', label: 'I have pitched my Script to a Producer/Agent' },
  { value: 'formal_education', label: 'I have completed a formal education on Screenwriting' },
  { value: 'finished_feature', label: 'I have finished the bounded script of a Feature film' },
  { value: 'short_films', label: 'I have written the screenplay for Short films' },
  { value: 'formatting', label: 'I know how to format a Screenplay on a professional software' },
  { value: 'learning', label: 'I am still learning/struggling to finish a script' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const DIRECTION_OPTIONS = [
  { value: 'directed_feature', label: 'I have directed a full length Feature film' },
  { value: 'worked_professional', label: 'I have worked in a professional set for a Feature film' },
  { value: 'directed_short', label: 'I have directed a Short film' },
  { value: 'social_media', label: 'I have directed short videos for Social Media' },
  { value: 'assistant_director', label: 'I have worked as an Assistant Director' },
  { value: 'blocking', label: 'I know how to block or stage or frame a shot' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Film Direction' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const CINEMATOGRAPHY_OPTIONS = [
  { value: 'feature_dop', label: 'I have worked as a Cinematographer for a full-length Feature film' },
  { value: 'short_dop', label: 'I have worked as a Cinematographer for a Short film' },
  { value: 'assistant_dop', label: 'I have worked as an Assistant Cinematographer' },
  { value: 'professional_crew', label: 'I have worked with a professional production crew' },
  { value: 'camera_operator', label: 'I am just good at operating a Camera' },
  { value: 'lighting', label: 'I am just good at lighting a scene' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Cinematography' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const EDITING_OPTIONS = [
  { value: 'edited_feature', label: 'I have edited a full-length Feature film' },
  { value: 'short_projects', label: 'I have only worked on short films or smaller projects' },
  { value: 'professional_software', label: 'I am proficient with industry-standard software such as DaVinci Resolve or Adobe Premiere Pro' },
  { value: 'assistant_editor', label: 'I have worked as an Assistant Editor' },
  { value: 'simple_edits', label: 'I have only worked on straightforward edits with minimal or no VFX' },
  { value: 'cuts_transitions', label: 'I can only do simple cuts and transitions' },
  { value: 'mobile_apps', label: 'I can edit only on basic mobile apps' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Film Editing' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

const INTENT_OPTIONS = [
  { value: 'vacation', label: 'Enjoy a vacation combined with filmmaking' },
  { value: 'crew', label: 'Finding your crew' },
  { value: 'learn', label: 'Learn filmmaking in the best environment' },
  { value: 'make_film', label: 'Make your short film' },
  { value: 'networking', label: 'Networking/ Making new friends' },
  { value: 'equipment', label: 'Use Cinema-grade Equipment' },
  { value: 'other', label: 'Other' },
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

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

interface FormData {
  certificate_name: string;
  current_occupation: string;
  instagram_id: string;
  date_of_birth: string;
  address_line_1: string;
  address_line_2: string;
  state: string;
  pincode: string;
  gender: string;
  tshirt_size: string;
  has_editing_laptop: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  proficiency_screenwriting: string;
  proficiency_direction: string;
  proficiency_cinematography: string;
  proficiency_editing: string;
  top_3_movies: string;
  chronotype: string;
  meal_preference: string;
  food_allergies: string;
  medication_support: string;
  languages_known: string[];
  height_ft: string;
  photo_favorite_url: string;
  headshot_front_url: string;
  headshot_right_url: string;
  headshot_left_url: string;
  full_body_url: string;
  mbti_type: string;
  forge_intent: string;
  forge_intent_other: string;
  terms_accepted: boolean;
}

const KYFForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    certificate_name: '',
    current_occupation: '',
    instagram_id: '',
    date_of_birth: '',
    address_line_1: '',
    address_line_2: '',
    state: '',
    pincode: '',
    gender: '',
    tshirt_size: '',
    has_editing_laptop: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    proficiency_screenwriting: '',
    proficiency_direction: '',
    proficiency_cinematography: '',
    proficiency_editing: '',
    top_3_movies: '',
    chronotype: '',
    meal_preference: '',
    food_allergies: '',
    medication_support: '',
    languages_known: [],
    height_ft: '',
    photo_favorite_url: '',
    headshot_front_url: '',
    headshot_right_url: '',
    headshot_left_url: '',
    full_body_url: '',
    mbti_type: '',
    forge_intent: '',
    forge_intent_other: '',
    terms_accepted: false,
  });

  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Load existing responses on mount
  useEffect(() => {
    const loadExistingResponses = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('kyf_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setFormData({
          certificate_name: data.certificate_name || '',
          current_occupation: data.current_occupation || '',
          instagram_id: data.instagram_id || '',
          date_of_birth: data.date_of_birth || '',
          address_line_1: data.address_line_1 || '',
          address_line_2: data.address_line_2 || '',
          state: data.state || '',
          pincode: data.pincode || '',
          gender: data.gender || '',
          tshirt_size: data.tshirt_size || '',
          has_editing_laptop: data.has_editing_laptop === true ? 'yes' : data.has_editing_laptop === false ? 'no' : '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_number: data.emergency_contact_number || '',
          proficiency_screenwriting: data.proficiency_screenwriting || '',
          proficiency_direction: data.proficiency_direction || '',
          proficiency_cinematography: data.proficiency_cinematography || '',
          proficiency_editing: data.proficiency_editing || '',
          top_3_movies: data.top_3_movies?.join(', ') || '',
          chronotype: data.chronotype || '',
          meal_preference: data.meal_preference || '',
          food_allergies: data.food_allergies || '',
          medication_support: data.medication_support || '',
          languages_known: data.languages_known || [],
          height_ft: data.height_ft || '',
          photo_favorite_url: data.photo_favorite_url || '',
          headshot_front_url: data.headshot_front_url || '',
          headshot_right_url: data.headshot_right_url || '',
          headshot_left_url: data.headshot_left_url || '',
          full_body_url: data.full_body_url || '',
          mbti_type: data.mbti_type || '',
          forge_intent: data.forge_intent || '',
          forge_intent_other: data.forge_intent_other || '',
          terms_accepted: data.terms_accepted || false,
        });
      }
    };

    loadExistingResponses();
  }, [user]);

  // Save progress function
  const saveProgress = async () => {
    if (!user) return;
    const calculatedAge = calculateAge(formData.date_of_birth);

    try {
      await supabase.from('kyf_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name || null,
        current_occupation: formData.current_occupation || null,
        instagram_id: formData.instagram_id || null,
        age: calculatedAge,
        date_of_birth: formData.date_of_birth || null,
        address_line_1: formData.address_line_1 || null,
        address_line_2: formData.address_line_2 || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        gender: formData.gender || null,
        tshirt_size: formData.tshirt_size || null,
        has_editing_laptop: formData.has_editing_laptop === 'yes' ? true : formData.has_editing_laptop === 'no' ? false : null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_number: formData.emergency_contact_number || null,
        proficiency_screenwriting: formData.proficiency_screenwriting || null,
        proficiency_direction: formData.proficiency_direction || null,
        proficiency_cinematography: formData.proficiency_cinematography || null,
        proficiency_editing: formData.proficiency_editing || null,
        top_3_movies: formData.top_3_movies ? formData.top_3_movies.split(',').map(m => m.trim()) : null,
        chronotype: formData.chronotype || null,
        meal_preference: formData.meal_preference || null,
        food_allergies: formData.food_allergies || null,
        medication_support: formData.medication_support || null,
        languages_known: formData.languages_known.length > 0 ? formData.languages_known : null,
        height_ft: formData.height_ft || null,
        photo_favorite_url: formData.photo_favorite_url || null,
        headshot_front_url: formData.headshot_front_url || null,
        headshot_right_url: formData.headshot_right_url || null,
        headshot_left_url: formData.headshot_left_url || null,
        full_body_url: formData.full_body_url || null,
        mbti_type: formData.mbti_type || null,
        forge_intent: formData.forge_intent || null,
        forge_intent_other: formData.forge_intent_other || null,
        terms_accepted: formData.terms_accepted,
      }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleExitWithSave = async () => {
    await saveProgress();
    toast({ title: 'Progress saved', description: 'You can continue later from where you left off.' });
    navigate('/');
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const calculatedAge = calculateAge(formData.date_of_birth);

    try {
      const { error: kyfError } = await supabase.from('kyf_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name,
        current_occupation: formData.current_occupation,
        instagram_id: formData.instagram_id,
        age: calculatedAge,
        date_of_birth: formData.date_of_birth || null,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        state: formData.state,
        pincode: formData.pincode,
        gender: formData.gender,
        tshirt_size: formData.tshirt_size,
        has_editing_laptop: formData.has_editing_laptop === 'yes',
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        proficiency_screenwriting: formData.proficiency_screenwriting,
        proficiency_direction: formData.proficiency_direction,
        proficiency_cinematography: formData.proficiency_cinematography,
        proficiency_editing: formData.proficiency_editing,
        top_3_movies: formData.top_3_movies.split(',').map(m => m.trim()),
        chronotype: formData.chronotype,
        meal_preference: formData.meal_preference,
        food_allergies: formData.food_allergies,
        medication_support: formData.medication_support,
        languages_known: formData.languages_known,
        height_ft: formData.height_ft,
        photo_favorite_url: formData.photo_favorite_url,
        headshot_front_url: formData.headshot_front_url,
        headshot_right_url: formData.headshot_right_url,
        headshot_left_url: formData.headshot_left_url,
        full_body_url: formData.full_body_url,
        mbti_type: formData.mbti_type,
        forge_intent: formData.forge_intent,
        forge_intent_other: formData.forge_intent_other,
        terms_accepted: formData.terms_accepted,
        terms_accepted_at: formData.terms_accepted ? new Date().toISOString() : null,
      }, { onConflict: 'user_id' });

      if (kyfError) throw kyfError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ky_form_completed: true, kyf_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

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
      case 1: return !!(formData.certificate_name && formData.current_occupation && formData.instagram_id);
      case 2: return !!(formData.date_of_birth && formData.address_line_1 && formData.state && formData.pincode);
      case 3: return !!(formData.gender && formData.tshirt_size && formData.has_editing_laptop && formData.emergency_contact_name && formData.emergency_contact_number);
      case 4: return true; // Proficiency optional
      case 5: return !!(formData.top_3_movies && formData.chronotype && formData.meal_preference && formData.food_allergies && formData.medication_support);
      case 6: return formData.languages_known.length > 0 && !!formData.height_ft;
      case 7: return !!(formData.photo_favorite_url && formData.headshot_front_url && formData.full_body_url);
      case 8: return !!(formData.mbti_type && formData.forge_intent && (formData.forge_intent !== 'other' || formData.forge_intent_other));
      case 9: return formData.terms_accepted;
      default: return false;
    }
  };

  const handleBack = () => {
    if (step === 0) {
      setShowExitDialog(true);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleNext = async () => {
    if (step > 0) await saveProgress();
    setStep(s => s + 1);
  };

  // Show completion screen if form was submitted
  if (showCompletion) {
    return <KYFormCompletion cohortType="FORGE" />;
  }

  const calculatedAge = calculateAge(formData.date_of_birth);

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} stepTitle="Know Your Filmmaker">
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
            <p className="text-sm text-muted-foreground mb-5">Let's start with the basics</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full name (as you want it on your certificate) *</Label>
                <Input value={formData.certificate_name} onChange={e => updateField('certificate_name', e.target.value)} placeholder="e.g. Arjun Sharma" className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>What are you currently doing? *</Label>
                <Input value={formData.current_occupation} onChange={e => updateField('current_occupation', e.target.value)} placeholder="e.g. Student, Working Professional" className="h-11 bg-secondary/50" />
              </div>
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
              <div className="space-y-2">
                <Label>Address Line 1 *</Label>
                <Input value={formData.address_line_1} onChange={e => updateField('address_line_1', e.target.value)} placeholder="e.g. 123, Main Street" className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input value={formData.address_line_2} onChange={e => updateField('address_line_2', e.target.value)} placeholder="e.g. Apt 4B, Near Park" className="h-11 bg-secondary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input value={formData.state} onChange={e => updateField('state', e.target.value)} placeholder="e.g. Karnataka" className="h-11 bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} placeholder="e.g. 560001" className="h-11 bg-secondary/50" />
                </div>
              </div>
            </div>
          </KYFormCard>
        );

      case 3:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={3} stepTitle="Preferences & Emergency">
            <div className="space-y-4">
              <RadioSelectField label="Your Gender" required options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} value={formData.gender} onChange={v => updateField('gender', v)} columns={3} />
              <div className="space-y-2">
                <Label>Your T-shirt size *</Label>
                <Input value={formData.tshirt_size} onChange={e => updateField('tshirt_size', e.target.value)} placeholder="S / M / L / XL / XXL" className="h-11 bg-secondary/50" />
              </div>
              <RadioSelectField label="Do you have a laptop that supports video editing?" required options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} value={formData.has_editing_laptop} onChange={v => updateField('has_editing_laptop', v)} columns={2} />
              <div className="space-y-2">
                <Label>Emergency contact name *</Label>
                <Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} placeholder="e.g. Parent or Guardian name" className="h-11 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Emergency contact number *</Label>
                <Input value={formData.emergency_contact_number} onChange={e => updateField('emergency_contact_number', e.target.value)} placeholder="e.g. +91 9876543210" className="h-11 bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 4:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={4} stepTitle="Proficiency Level">
            <p className="text-sm text-muted-foreground mb-4">Help us understand your experience (optional)</p>
            <div className="space-y-4">
              <ProficiencyField label="Screenwriting" options={SCREENWRITING_OPTIONS} value={formData.proficiency_screenwriting} onChange={v => updateField('proficiency_screenwriting', v)} />
              <ProficiencyField label="Film Direction" options={DIRECTION_OPTIONS} value={formData.proficiency_direction} onChange={v => updateField('proficiency_direction', v)} />
              <ProficiencyField label="Cinematography" options={CINEMATOGRAPHY_OPTIONS} value={formData.proficiency_cinematography} onChange={v => updateField('proficiency_cinematography', v)} />
              <ProficiencyField label="Editing" options={EDITING_OPTIONS} value={formData.proficiency_editing} onChange={v => updateField('proficiency_editing', v)} />
            </div>
          </KYFormCard>
        );

      case 5:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={5} stepTitle="Personality & Preferences">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your top 3 movies? *</Label>
                <Textarea value={formData.top_3_movies} onChange={e => updateField('top_3_movies', e.target.value)} placeholder="Separate with commas" className="bg-secondary/50" />
              </div>
              <RadioSelectField label="You are" required options={[{ value: 'early_bird', label: '🌅 An Early bird' }, { value: 'night_owl', label: '🦉 A Night Owl' }]} value={formData.chronotype} onChange={v => updateField('chronotype', v)} columns={2} />
              <RadioSelectField label="Your Meal preference" required options={[{ value: 'vegetarian', label: '🌱 Vegetarian' }, { value: 'non_vegetarian', label: '🟥 Non-Vegetarian' }]} value={formData.meal_preference} onChange={v => updateField('meal_preference', v)} columns={2} />
              <div className="space-y-2">
                <Label>Are you allergic to any type of food? *</Label>
                <Textarea value={formData.food_allergies} onChange={e => updateField('food_allergies', e.target.value)} placeholder="Please let us know" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Do you require any medication support? *</Label>
                <Textarea value={formData.medication_support} onChange={e => updateField('medication_support', e.target.value)} placeholder="Please let us know" className="bg-secondary/50" />
              </div>
            </div>
          </KYFormCard>
        );

      case 6:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={6} stepTitle="Casting Call">
            <p className="text-sm text-muted-foreground mb-4">
              At Forge we will be dividing the cohort into groups to cast all of you as actors in other's short films. 
              We will need a bit of information to make a casting sheet. Experience how it is on the other side of the camera now.
            </p>
            <div className="space-y-4">
              <MultiSelectField label="What languages do you know?" required options={LANGUAGES} value={formData.languages_known} onChange={v => updateField('languages_known', v)} />
              <div className="space-y-2">
                <Label>Your Height (in ft) *</Label>
                <Input 
                  value={formData.height_ft} 
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) <= 10)) {
                      updateField('height_ft', value);
                    }
                  }} 
                  placeholder="e.g. 5'8" 
                  className="h-11 bg-secondary/50" 
                />
                <p className="text-xs text-muted-foreground">Maximum: 10 ft</p>
              </div>
            </div>
          </KYFormCard>
        );

      case 7:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={7} stepTitle="Your Pictures">
            <div className="grid grid-cols-2 gap-3">
              <PhotoUploadField label="A photo you love" description="(your face should be seen)" required value={formData.photo_favorite_url} onChange={v => updateField('photo_favorite_url', v)} folder="favorite" />
              <PhotoUploadField label="HeadShot Front" required value={formData.headshot_front_url} onChange={v => updateField('headshot_front_url', v)} folder="headshot-front" />
              <PhotoUploadField label="HeadShot Right" value={formData.headshot_right_url} onChange={v => updateField('headshot_right_url', v)} folder="headshot-right" />
              <PhotoUploadField label="HeadShot Left" value={formData.headshot_left_url} onChange={v => updateField('headshot_left_url', v)} folder="headshot-left" />
              <PhotoUploadField label="Full Body Shot" required value={formData.full_body_url} onChange={v => updateField('full_body_url', v)} folder="full-body" />
            </div>
          </KYFormCard>
        );

      case 8:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={8} stepTitle="Understanding You">
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
                  {MBTI_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => updateField('mbti_type', type)} className={`p-2 sm:p-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all tap-scale ${formData.mbti_type === type ? 'border-forge-gold bg-forge-gold/20 text-forge-gold' : 'border-border bg-card hover:border-forge-gold/50'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <RadioSelectField label="What is the one thing you really want to do at the Forge?" required options={INTENT_OPTIONS} value={formData.forge_intent} onChange={v => updateField('forge_intent', v)} />
              {formData.forge_intent === 'other' && (
                <div className="space-y-2">
                  <Label>If Other, what?</Label>
                  <Input value={formData.forge_intent_other} onChange={e => updateField('forge_intent_other', e.target.value)} placeholder="Please describe your intent" className="h-11 bg-secondary/50" />
                </div>
              )}
            </div>
          </KYFormCard>
        );

      case 9:
        return (
          <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={9} stepTitle="Terms and Conditions">
            <div className="space-y-4">
              <Collapsible open={termsExpanded} onOpenChange={setTermsExpanded}>
                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" checked={formData.terms_accepted} onCheckedChange={(checked) => updateField('terms_accepted', checked === true)} className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <CollapsibleTrigger asChild>
                          <button type="button" className="text-forge-gold underline hover:text-forge-yellow transition-colors inline-flex items-center gap-1">
                            terms and conditions
                            <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", termsExpanded && "rotate-180")} />
                          </button>
                        </CollapsibleTrigger>
                        {' '}of the Forge program.
                      </label>
                    </div>
                  </div>
                </div>
                
                <CollapsibleContent className="mt-3">
                  <ScrollArea className="h-[40vh] rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="space-y-4 text-sm text-muted-foreground pr-4">
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">1. Program Overview</h3>
                        <p>The Forge is an immersive filmmaking/creator/writing program designed to provide participants with hands-on experience in their chosen discipline. By participating, you agree to abide by all program guidelines, schedules, and instructions provided by mentors and organizers.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">2. Participant Responsibilities</h3>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Attend all scheduled sessions and activities punctually</li>
                          <li>Treat fellow participants, mentors, and staff with respect</li>
                          <li>Follow all safety guidelines and instructions</li>
                          <li>Take responsibility for personal belongings</li>
                          <li>Maintain professional conduct throughout the program</li>
                        </ul>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">3. Content & Media Rights</h3>
                        <p>By participating in the Forge, you grant us permission to use photographs, videos, and other media featuring your participation for promotional and educational purposes. All content created during the program may be used by The Forge for showcasing purposes.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">4. Health & Safety</h3>
                        <p>Participants must disclose any relevant health conditions or dietary requirements. The Forge team will make reasonable accommodations but cannot guarantee all special requirements can be met. Participants are responsible for any personal medication.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">5. Cancellation & Refund Policy</h3>
                        <p>Cancellation requests must be submitted in writing. Refunds are subject to the specific policy communicated at the time of registration. The Forge reserves the right to cancel or reschedule programs due to unforeseen circumstances.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">6. Code of Conduct</h3>
                        <p>Any behavior deemed inappropriate, disruptive, or harmful to other participants or the program may result in immediate dismissal without refund. This includes but is not limited to harassment, discrimination, or violation of safety protocols.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">7. Liability</h3>
                        <p>Participation in The Forge is at your own risk. The organizers are not liable for any personal injury, loss, or damage to property during the program. Participants are encouraged to obtain personal insurance coverage.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">8. Privacy</h3>
                        <p>Your personal information will be handled in accordance with our privacy policy. We collect information necessary for program administration and may share relevant details with mentors and partners for program delivery.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">9. Changes to Terms</h3>
                        <p>The Forge reserves the right to modify these terms at any time. Participants will be notified of significant changes. Continued participation constitutes acceptance of modified terms.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-sm font-semibold text-foreground mb-2">10. Agreement</h3>
                        <p>By checking the acceptance box, you confirm that you have read, understood, and agree to all terms and conditions outlined above. You also confirm that all information provided in this form is accurate and complete.</p>
                      </section>
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </KYFormCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center py-4 sm:py-6 px-3 sm:px-4 bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-forge-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-forge-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Card stack - no external progress bar */}
        <div className="mb-6">
          <KYFormCardStack currentStep={step} totalSteps={STEP_TITLES.length}>
            {STEP_TITLES.map((title, index) => (
              <div key={index}>
                {renderStepContent(index)}
              </div>
            ))}
          </KYFormCardStack>
        </div>

        {/* Navigation - compact pill buttons */}
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

      {/* Exit dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save and leave?</AlertDialogTitle>
            <AlertDialogDescription>Your progress will be saved and you can continue later.</AlertDialogDescription>
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

export default KYFForm;
