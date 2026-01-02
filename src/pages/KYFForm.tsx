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
import { PhotoUploadField } from '@/components/onboarding/PhotoUploadField';
import { User, MapPin, Heart, Film, Camera, Sparkles, FileCheck, ExternalLink } from 'lucide-react';
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

interface FormData {
  certificate_name: string;
  current_occupation: string;
  instagram_id: string;
  age: string;
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
  const [formData, setFormData] = useState<FormData>({
    certificate_name: '',
    current_occupation: '',
    instagram_id: '',
    age: '',
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

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Insert KYF response
      const { error: kyfError } = await supabase.from('kyf_responses').upsert({
        user_id: user.id,
        certificate_name: formData.certificate_name,
        current_occupation: formData.current_occupation,
        instagram_id: formData.instagram_id,
        age: formData.age ? parseInt(formData.age) : null,
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

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ky_form_completed: true, kyf_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      toast({ title: 'Welcome to the Forge!', description: 'Your KYF form has been submitted successfully.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!(formData.certificate_name && formData.current_occupation && formData.instagram_id);
      case 1: return !!(formData.age && formData.date_of_birth && formData.address_line_1 && formData.state && formData.pincode);
      case 2: return !!(formData.gender && formData.tshirt_size && formData.has_editing_laptop && formData.emergency_contact_name && formData.emergency_contact_number);
      case 3: return !!(formData.proficiency_screenwriting && formData.proficiency_direction && formData.proficiency_cinematography && formData.proficiency_editing);
      case 4: return !!(formData.top_3_movies && formData.chronotype && formData.meal_preference && formData.food_allergies && formData.medication_support);
      case 5: return formData.languages_known.length > 0 && !!formData.height_ft;
      case 6: return !!(formData.photo_favorite_url && formData.headshot_front_url && formData.full_body_url);
      case 7: return !!(formData.mbti_type && formData.forge_intent && (formData.forge_intent !== 'other' || formData.forge_intent_other));
      case 8: return formData.terms_accepted;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">General Details</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full name (as you want it on your certificate) *</Label>
                <Input value={formData.certificate_name} onChange={e => updateField('certificate_name', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>What are you currently doing? *</Label>
                <Input value={formData.current_occupation} onChange={e => updateField('current_occupation', e.target.value)} placeholder="e.g. Student, Working Professional" className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Your Instagram ID *</Label>
                <Input value={formData.instagram_id} onChange={e => updateField('instagram_id', e.target.value)} placeholder="@yourhandle" className="h-12 bg-secondary/50" />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Personal Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Age *</Label>
                  <Input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} className="h-12 bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className="h-12 bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address Line 1 *</Label>
                <Input value={formData.address_line_1} onChange={e => updateField('address_line_1', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input value={formData.address_line_2} onChange={e => updateField('address_line_2', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={formData.state} onChange={e => updateField('state', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Basic Preferences & Emergency Details</h2>
            </div>
            <div className="space-y-4">
              <RadioSelectField
                label="Your Gender"
                required
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                value={formData.gender}
                onChange={v => updateField('gender', v)}
                columns={3}
              />
              <div className="space-y-2">
                <Label>Your T-shirt size *</Label>
                <Input value={formData.tshirt_size} onChange={e => updateField('tshirt_size', e.target.value)} placeholder="S / M / L / XL / XXL" className="h-12 bg-secondary/50" />
              </div>
              <RadioSelectField
                label="Do you have a laptop that supports video editing that you can bring?"
                required
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                value={formData.has_editing_laptop}
                onChange={v => updateField('has_editing_laptop', v)}
                columns={2}
              />
              <p className="text-xs text-muted-foreground -mt-2">(having your laptop makes the process faster for you and easier to edit your final cut back home)</p>
              <div className="space-y-2">
                <Label>Emergency contact name *</Label>
                <Input value={formData.emergency_contact_name} onChange={e => updateField('emergency_contact_name', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Emergency contact number *</Label>
                <Input value={formData.emergency_contact_number} onChange={e => updateField('emergency_contact_number', e.target.value)} className="h-12 bg-secondary/50" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Film className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Proficiency Level</h2>
              <p className="text-muted-foreground">We want to understand your proficiency level to curate the best learning experience for you.</p>
            </div>
            <div className="space-y-6">
              <ProficiencyField label="Screenwriting" required options={SCREENWRITING_OPTIONS} value={formData.proficiency_screenwriting} onChange={v => updateField('proficiency_screenwriting', v)} />
              <ProficiencyField label="Film Direction" required options={DIRECTION_OPTIONS} value={formData.proficiency_direction} onChange={v => updateField('proficiency_direction', v)} />
              <ProficiencyField label="Cinematography" required options={CINEMATOGRAPHY_OPTIONS} value={formData.proficiency_cinematography} onChange={v => updateField('proficiency_cinematography', v)} />
              <ProficiencyField label="Editing" required options={EDITING_OPTIONS} value={formData.proficiency_editing} onChange={v => updateField('proficiency_editing', v)} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Personality & Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your top 3 movies? *</Label>
                <Textarea value={formData.top_3_movies} onChange={e => updateField('top_3_movies', e.target.value)} placeholder="Separate with commas: Movie 1, Movie 2, Movie 3" className="bg-secondary/50" />
              </div>
              <RadioSelectField
                label="You are"
                required
                options={[
                  { value: 'early_bird', label: '🌅 An Early bird' },
                  { value: 'night_owl', label: '🦉 A Night Owl' },
                ]}
                value={formData.chronotype}
                onChange={v => updateField('chronotype', v)}
                columns={2}
              />
              <RadioSelectField
                label="Your Meal preference"
                required
                options={[
                  { value: 'vegetarian', label: '🌱 Vegetarian' },
                  { value: 'non_vegetarian', label: '🟥 Non-Vegetarian' },
                ]}
                value={formData.meal_preference}
                onChange={v => updateField('meal_preference', v)}
                columns={2}
              />
              <div className="space-y-2">
                <Label>Are you allergic to any type of food/any particular thing? *</Label>
                <Textarea value={formData.food_allergies} onChange={e => updateField('food_allergies', e.target.value)} placeholder="Please let us know :)" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Do you require any support with regard to medication? *</Label>
                <Textarea value={formData.medication_support} onChange={e => updateField('medication_support', e.target.value)} className="bg-secondary/50" />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Casting Call</h2>
            </div>
            <div className="space-y-4">
              <MultiSelectField
                label="What languages do you know?"
                required
                options={LANGUAGES}
                value={formData.languages_known}
                onChange={v => updateField('languages_known', v)}
              />
              <div className="space-y-2">
                <Label>Your Height (in ft) *</Label>
                <Input value={formData.height_ft} onChange={e => updateField('height_ft', e.target.value)} placeholder="e.g. 5'8" className="h-12 bg-secondary/50" />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your Pictures</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PhotoUploadField label="A photo you love" description="(your face should be seen, for social media)" required value={formData.photo_favorite_url} onChange={v => updateField('photo_favorite_url', v)} folder="favorite" />
              <PhotoUploadField label="HeadShot Front" required value={formData.headshot_front_url} onChange={v => updateField('headshot_front_url', v)} folder="headshot-front" />
              <PhotoUploadField label="HeadShot Right" value={formData.headshot_right_url} onChange={v => updateField('headshot_right_url', v)} folder="headshot-right" />
              <PhotoUploadField label="HeadShot Left" value={formData.headshot_left_url} onChange={v => updateField('headshot_left_url', v)} folder="headshot-left" />
              <PhotoUploadField label="Full Body Shot" required value={formData.full_body_url} onChange={v => updateField('full_body_url', v)} folder="full-body" />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">To Understand You Deeper</h2>
              <p className="text-muted-foreground text-sm">To assign you to groups with individuals who are compatible with your style of thinking and filmmaking, we would like you to take a short test to determine your personality type.</p>
            </div>
            <div className="space-y-4">
              <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <ExternalLink className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Take the personality test</span>
              </a>
              <div className="space-y-2">
                <Label>Your Myers-Briggs Type Indicator Test Result *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MBTI_TYPES.map(type => (
                    <button key={type} type="button" onClick={() => updateField('mbti_type', type)} className={`p-3 rounded-lg border text-sm font-medium transition-all ${formData.mbti_type === type ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Intent at the Forge</h3>
                <RadioSelectField
                  label="What is the one thing you really, really want to do at the Forge?"
                  required
                  options={INTENT_OPTIONS}
                  value={formData.forge_intent}
                  onChange={v => updateField('forge_intent', v)}
                />
                {formData.forge_intent === 'other' && (
                  <div className="mt-3 space-y-2">
                    <Label>If Other, what?</Label>
                    <Input value={formData.forge_intent_other} onChange={e => updateField('forge_intent_other', e.target.value)} className="h-12 bg-secondary/50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Terms and Conditions</h2>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.terms_accepted}
                  onCheckedChange={(checked) => updateField('terms_accepted', checked === true)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <a href="#" className="text-primary underline">terms and conditions</a> of the Forge program. I understand and accept the rules and guidelines that have been shared with me.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleBack = () => {
    if (step === 0) {
      setShowExitDialog(true);
    } else {
      setStep(s => s - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-6 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <KYFormProgress currentStep={step} totalSteps={STEP_TITLES.length} stepTitles={STEP_TITLES} />
        
        <div className="mt-8 mb-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
          {renderStep()}
        </div>

        <KYFormNavigation
          currentStep={step}
          totalSteps={STEP_TITLES.length}
          canProceed={canProceed()}
          loading={loading}
          onBack={handleBack}
          onNext={() => setStep(s => s + 1)}
          onSubmit={handleSubmit}
          showBackOnFirstStep={true}
        />
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the form?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress won't be saved. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue filling</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/')}>Leave anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KYFForm;
