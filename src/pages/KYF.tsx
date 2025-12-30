import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Loader2, User, Instagram, Twitter, Briefcase } from 'lucide-react';

const specialties = [
  'Filmmaking',
  'Writing',
  'Photography',
  'Music Production',
  'Animation',
  'Podcasting',
  'Content Creation',
  'Other',
];

const KYF: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    specialty: '',
    instagram_handle: '',
    twitter_handle: '',
    phone: '',
  });

  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        kyf_completed: true,
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
      title: 'Profile Complete!',
      description: 'Welcome to the LevelUp community.',
    });
    navigate('/');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
              <p className="text-muted-foreground">Help your fellow creators get to know you</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Your name"
                  value={formData.full_name}
                  onChange={(e) => updateFormData('full_name', e.target.value)}
                  className="h-12 bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself and what you create..."
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  className="min-h-[100px] bg-secondary/50 resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">What's your craft?</h2>
              <p className="text-muted-foreground">Select your primary area of focus</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => updateFormData('specialty', specialty)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.specialty === specialty
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{specialty}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Instagram className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Stay connected</h2>
              <p className="text-muted-foreground">Share your socials (optional)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="instagram"
                    placeholder="@yourhandle"
                    value={formData.instagram_handle}
                    onChange={(e) => updateFormData('instagram_handle', e.target.value)}
                    className="h-12 pl-10 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="twitter"
                    placeholder="@yourhandle"
                    value={formData.twitter_handle}
                    onChange={(e) => updateFormData('twitter_handle', e.target.value)}
                    className="h-12 pl-10 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 12345 67890"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="h-12 bg-secondary/50"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name.trim().length > 0;
      case 2:
        return formData.specialty.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'gradient-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              variant="premium"
              size="lg"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="premium"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYF;
