import React, { useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Loader2, User } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';
import { readFileAsDataURL } from '@/lib/cropImage';
import type { ProfileData } from '@/hooks/useProfileData';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const PROFICIENCY_LEVELS = ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'];

const CHRONOTYPES = ['Early Bird', 'Night Owl', 'In Between'];

interface ProfileEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onSaved: () => void;
  scrollToSection?: string | null;
  profileData?: ProfileData | null;
}

export const ProfileEditSheet: React.FC<ProfileEditSheetProps> = ({
  open,
  onOpenChange,
  profile,
  onSaved,
  scrollToSection,
  profileData,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoSectionRef = useRef<HTMLDivElement>(null);
  const instagramSectionRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const generalRef = useRef<HTMLDivElement>(null);
  const personalityRef = useRef<HTMLDivElement>(null);
  const proficiencyRef = useRef<HTMLDivElement>(null);
  const influencesRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  const cohortType = profileData?.cohortType || null;
  const kyData = profileData?.kyfResponse || profileData?.kywResponse || profileData?.kycResponse;

  React.useEffect(() => {
    if (open && scrollToSection) {
      const timer = setTimeout(() => {
        const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
          photo: photoSectionRef,
          instagram: instagramSectionRef,
          about: aboutRef,
          general: generalRef,
          personality: personalityRef,
          proficiency: proficiencyRef,
          influences: influencesRef,
          practice: practiceRef,
          personal: personalRef,
        };
        const targetRef = refMap[scrollToSection];
        if (targetRef?.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetRef.current.classList.add('highlight-pulse');
          setTimeout(() => targetRef.current?.classList.remove('highlight-pulse'), 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, scrollToSection]);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    tagline: profile?.tagline || '',
    city: profile?.city || '',
    specialty: profile?.specialty || '',
    instagram_handle: profile?.instagram_handle || '',
    twitter_handle: profile?.twitter_handle || '',
    phone: profile?.phone || '',
  });

  const [kyFormData, setKyFormData] = useState<Record<string, any>>({});

  // Initialize form data from profile and KY data
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        tagline: profile.tagline || '',
        city: profile.city || '',
        specialty: profile.specialty || '',
        instagram_handle: profile.instagram_handle || '',
        twitter_handle: profile.twitter_handle || '',
        phone: profile.phone || '',
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  React.useEffect(() => {
    if (kyData) {
      setKyFormData({ ...kyData });
    }
  }, [kyData]);

  const updateKyField = (key: string, value: any) => {
    setKyFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageToCrop(dataUrl);
      setCropperOpen(true);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({ title: 'Error', description: 'Failed to read image file.', variant: 'destructive' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user?.id) return;

    setUploadingAvatar(true);

    try {
      const file = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' });
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast({ title: 'Photo Updated', description: 'Your profile photo has been updated.' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Upload Failed', description: 'Failed to upload photo. Please try again.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update KY response table if we have cohort data
      if (cohortType && Object.keys(kyFormData).length > 0) {
        const tableName = cohortType === 'FORGE' ? 'kyf_responses'
          : cohortType === 'FORGE_WRITING' ? 'kyw_responses'
          : cohortType === 'FORGE_CREATORS' ? 'kyc_responses'
          : null;

        if (tableName) {
          // Only send fields that exist in the KY data (avoid sending id, user_id, etc. from state)
          const { id, created_at, updated_at, ...kyFieldsToSave } = kyFormData;

          const { error: kyError } = await supabase
            .from(tableName)
            .upsert(
              { user_id: user.id, ...kyFieldsToSave },
              { onConflict: 'user_id' }
            );

          if (kyError) {
            console.error('KY save error:', kyError);
            // Don't throw — profile was already saved
            toast({ title: 'Partial Save', description: 'Profile updated but some KY details failed to save.', variant: 'destructive' });
            setSaving(false);
            onSaved();
            onOpenChange(false);
            return;
          }
        }
      }

      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderSelectField = (label: string, value: string, options: string[], onChange: (val: string) => void) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderTagsInput = (label: string, value: string[] | null, fieldKey: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={(value || []).join(', ')}
        onChange={(e) => {
          const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
          updateKyField(fieldKey, tags.length > 0 ? tags : null);
        }}
        placeholder="Separate with commas"
      />
      <p className="text-[10px] text-muted-foreground">Separate items with commas</p>
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Avatar Upload Section */}
            <div ref={photoSectionRef} className="flex flex-col items-center gap-4 transition-all duration-500 rounded-lg p-2 -m-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  <AvatarImage src={avatarUrl} alt={formData.full_name} />
                  <AvatarFallback className="bg-secondary text-muted-foreground">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-xs"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 mr-1" />
                    Change Photo
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* About / Basic Info */}
            <div ref={aboutRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Basic Info
              </h3>
              
              <FloatingInput
                id="full_name"
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />

              <FloatingInput
                id="tagline"
                label="Tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />

              <FloatingInput
                id="specialty"
                label="Role / Specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />

              <FloatingInput
                id="city"
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />

              <FloatingTextarea
                id="bio"
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contact Info
              </h3>
              
              <FloatingInput
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div ref={instagramSectionRef} className="transition-all duration-500 rounded-lg p-2 -m-2">
                <FloatingInput
                  id="instagram"
                  label="Instagram Handle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                />
              </div>

              <FloatingInput
                id="twitter"
                label="Twitter Handle"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
              />
            </div>

            {/* === KY FORM SECTIONS (conditional on cohort) === */}
            {cohortType && (
              <>
                {/* General Details */}
                <div ref={generalRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    General Details
                  </h3>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Certificate Name</Label>
                    <Input
                      value={kyFormData.certificate_name || ''}
                      onChange={(e) => updateKyField('certificate_name', e.target.value)}
                      placeholder="Name as it appears on certificate"
                    />
                  </div>

                  {(cohortType === 'FORGE' || cohortType === 'FORGE_WRITING') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Current Occupation</Label>
                      <Input
                        value={kyFormData.current_occupation || ''}
                        onChange={(e) => updateKyField('current_occupation', e.target.value)}
                        placeholder="What do you do currently?"
                      />
                    </div>
                  )}

                  {cohortType === 'FORGE_CREATORS' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Current Status</Label>
                      <Input
                        value={kyFormData.current_status || ''}
                        onChange={(e) => updateKyField('current_status', e.target.value)}
                        placeholder="Student, Working Professional, etc."
                      />
                    </div>
                  )}
                </div>

                {/* Personality */}
                <div ref={personalityRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Personality
                  </h3>
                  
                  {renderSelectField('MBTI Type', kyFormData.mbti_type || '', MBTI_TYPES, (val) => updateKyField('mbti_type', val))}
                </div>

                {/* Proficiency */}
                <div ref={proficiencyRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Proficiency
                  </h3>

                  {cohortType === 'FORGE' && (
                    <>
                      {renderSelectField('Screenwriting', kyFormData.proficiency_screenwriting || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_screenwriting', val))}
                      {renderSelectField('Direction', kyFormData.proficiency_direction || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_direction', val))}
                      {renderSelectField('Cinematography', kyFormData.proficiency_cinematography || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_cinematography', val))}
                      {renderSelectField('Editing', kyFormData.proficiency_editing || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_editing', val))}
                    </>
                  )}

                  {cohortType === 'FORGE_WRITING' && (
                    <>
                      {renderSelectField('Writing', kyFormData.proficiency_writing || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_writing', val))}
                      {renderSelectField('Story & Voice', kyFormData.proficiency_story_voice || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_story_voice', val))}
                    </>
                  )}

                  {cohortType === 'FORGE_CREATORS' && (
                    <>
                      {renderSelectField('Content Creation', kyFormData.proficiency_content_creation || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_content_creation', val))}
                      {renderSelectField('Storytelling', kyFormData.proficiency_storytelling || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_storytelling', val))}
                      {renderSelectField('Video Production', kyFormData.proficiency_video_production || '', PROFICIENCY_LEVELS, (val) => updateKyField('proficiency_video_production', val))}
                    </>
                  )}
                </div>

                {/* Influences */}
                <div ref={influencesRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Influences
                  </h3>

                  {cohortType === 'FORGE' && renderTagsInput('Top 3 Movies', kyFormData.top_3_movies, 'top_3_movies')}
                  {cohortType === 'FORGE_WRITING' && renderTagsInput('Top 3 Writers / Books', kyFormData.top_3_writers_books, 'top_3_writers_books')}
                  {cohortType === 'FORGE_CREATORS' && renderTagsInput('Top 3 Creators', kyFormData.top_3_creators, 'top_3_creators')}

                  {renderSelectField('Chronotype', kyFormData.chronotype || '', CHRONOTYPES, (val) => updateKyField('chronotype', val))}
                </div>

                {/* Practice */}
                <div ref={practiceRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Practice & Safety
                  </h3>

                  {cohortType === 'FORGE_WRITING' && renderTagsInput('Writing Types', kyFormData.writing_types, 'writing_types')}

                  {cohortType === 'FORGE' && renderTagsInput('Languages Known', kyFormData.languages_known, 'languages_known')}

                  {cohortType === 'FORGE_CREATORS' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Primary Platform</Label>
                      <Input
                        value={kyFormData.primary_platform || ''}
                        onChange={(e) => updateKyField('primary_platform', e.target.value)}
                        placeholder="YouTube, Instagram, etc."
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Emergency Contact Name</Label>
                    <Input
                      value={kyFormData.emergency_contact_name || ''}
                      onChange={(e) => updateKyField('emergency_contact_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Emergency Contact Number</Label>
                    <Input
                      value={kyFormData.emergency_contact_number || ''}
                      onChange={(e) => updateKyField('emergency_contact_number', e.target.value)}
                    />
                  </div>
                </div>

                {/* Personal Details */}
                <div ref={personalRef} className="space-y-4 transition-all duration-500 rounded-lg p-2 -m-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Personal Details
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                    <Input
                      type="date"
                      value={kyFormData.date_of_birth || ''}
                      onChange={(e) => updateKyField('date_of_birth', e.target.value)}
                    />
                  </div>

                  {cohortType === 'FORGE_WRITING' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Primary Language</Label>
                      <Input
                        value={kyFormData.primary_language || ''}
                        onChange={(e) => updateKyField('primary_language', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
                    <Input
                      value={kyFormData.whatsapp_number || ''}
                      onChange={(e) => updateKyField('whatsapp_number', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ImageCropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="round"
      />
    </>
  );
};
