import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Camera, Upload, Film, Pen, Users, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PhoneInput } from '@/components/onboarding/PhoneInput';
import type { Database } from '@/integrations/supabase/types';

type Edition = Database['public']['Tables']['editions']['Row'];

const getCohortIcon = (cohortType: string) => {
  switch (cohortType) {
    case 'FORGE': return Film;
    case 'FORGE_WRITING': return Pen;
    case 'FORGE_CREATORS': return Users;
    default: return Film;
  }
};

const getCohortLabel = (cohortType: string) => {
  switch (cohortType) {
    case 'FORGE': return 'Filmmaking';
    case 'FORGE_WRITING': return 'Writing';
    case 'FORGE_CREATORS': return 'Creators';
    default: return 'Forge';
  }
};

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
};

const ProfileSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    edition_id: '',
    avatar_url: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Fetch active editions
  const { data: editions, isLoading: editionsLoading } = useQuery({
    queryKey: ['active-editions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: true });
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Pre-fill name and email from auth/profile data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || profile?.full_name || prev.full_name,
        email: user.email || prev.email,
        avatar_url: profile?.avatar_url || prev.avatar_url,
      }));
    }
  }, [user, profile]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: 'Photo uploaded successfully!' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const selectedEdition = editions?.find(e => e.id === formData.edition_id);

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.full_name || !formData.phone || !formData.city || !formData.edition_id) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields and select an edition.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        avatar_url: formData.avatar_url || null,
        edition_id: formData.edition_id,
        profile_setup_completed: true,
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    await refreshProfile();
    toast({
      title: 'Profile Created!',
      description: 'Now let\'s get to know you better.',
    });
    
    // Navigate to the appropriate KY form based on selected edition's cohort type
    switch (selectedEdition?.cohort_type) {
      case 'FORGE':
        navigate('/kyf-form');
        break;
      case 'FORGE_CREATORS':
        navigate('/kyc-form');
        break;
      case 'FORGE_WRITING':
        navigate('/kyw-form');
        break;
      default:
        navigate('/');
    }
  };

  const canSubmit = formData.full_name && formData.email && formData.phone && formData.city && formData.edition_id;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Confirm your details</h1>
          <p className="text-muted-foreground">
            Just a few more details to personalise your Forge experience.
            <br />
            <span className="text-sm">You can update this later.</span>
          </p>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {formData.full_name?.charAt(0) || <Camera className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">Upload a profile photo *</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="As you want it displayed inside the app"
              value={formData.full_name}
              onChange={(e) => updateFormData('full_name', e.target.value)}
              className="h-12 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Your Email ID
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="h-12 bg-secondary/30 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <PhoneInput
              label="Your WhatsApp Number"
              value={formData.phone}
              onChange={(value) => updateFormData('phone', value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City You're Currently Based In *</Label>
            <Input
              id="city"
              placeholder="Your city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className="h-12 bg-secondary/50"
            />
          </div>
        </div>

        {/* Edition Selection */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-lg font-semibold">Choose Your Forge Edition *</Label>
            <p className="text-sm text-muted-foreground">Select the program and batch you want to join</p>
          </div>
          
          {editionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : editions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No editions available at the moment.</p>
              <p className="text-sm">Please check back later.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {editions?.map((edition) => {
                const Icon = getCohortIcon(edition.cohort_type);
                const isSelected = formData.edition_id === edition.id;
                
                return (
                  <button
                    key={edition.id}
                    type="button"
                    onClick={() => updateFormData('edition_id', edition.id)}
                    className={`
                      group relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border 
                      text-left transition-all duration-300 overflow-hidden tap-scale
                      ${isSelected 
                        ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/20' 
                        : 'border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card/80'}
                    `}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                      transition-all duration-300
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}
                    `}>
                      <Icon className="h-7 w-7" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg truncate pr-8">
                        {edition.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm text-muted-foreground">{edition.city}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {getCohortLabel(edition.cohort_type)}
                        </span>
                      </div>
                      {edition.forge_start_date && edition.forge_end_date && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground/80">
                            {formatDateRange(edition.forge_start_date, edition.forge_end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          variant="premium"
          size="xl"
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue to Dashboard
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetup;