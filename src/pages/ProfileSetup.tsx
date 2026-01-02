import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Camera, Upload, Film, Pen, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const cohortOptions = [
  { value: 'FORGE', label: 'Forge Filmmaking', icon: Film, description: 'For aspiring filmmakers' },
  { value: 'FORGE_CREATORS', label: 'Forge Creators', icon: Users, description: 'For content creators' },
  { value: 'FORGE_WRITING', label: 'Forge Writing', icon: Pen, description: 'For writers' },
];

const ProfileSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    cohort_type: '' as 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | '',
    avatar_url: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

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

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.full_name || !formData.email || !formData.phone || !formData.city || !formData.cohort_type) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // First, find or create an edition for this cohort type
    const { data: editions } = await supabase
      .from('editions')
      .select('id')
      .eq('cohort_type', formData.cohort_type)
      .limit(1);

    const editionId = editions?.[0]?.id || null;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        avatar_url: formData.avatar_url || null,
        edition_id: editionId,
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
    
    // Navigate to the appropriate KY form based on cohort
    switch (formData.cohort_type) {
      case 'FORGE':
        navigate('/kyf');
        break;
      case 'FORGE_CREATORS':
        navigate('/kyc');
        break;
      case 'FORGE_WRITING':
        navigate('/kyw');
        break;
      default:
        navigate('/');
    }
  };

  const canSubmit = formData.full_name && formData.email && formData.phone && formData.city && formData.cohort_type;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Let's set up your profile</h1>
          <p className="text-muted-foreground">
            This helps us personalise your experience inside the Forge app.
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
            <Label htmlFor="email">Your Email ID *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className="h-12 bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Your WhatsApp Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 12345 67890"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              className="h-12 bg-secondary/50"
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

        {/* Cohort Selection */}
        <div className="space-y-3">
          <Label>Which Forge program are you part of? *</Label>
          <div className="grid gap-3">
            {cohortOptions.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                onClick={() => updateFormData('cohort_type', value)}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  formData.cohort_type === value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  formData.cohort_type === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
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
