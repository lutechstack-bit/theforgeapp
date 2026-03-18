import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OccupationPillSelector } from './OccupationPillSelector';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { KYFormCard } from '@/components/kyform/KYFormCard';
import { KYFormCardStack } from '@/components/kyform/KYFormCardStack';
import { ArrowLeft, Loader2, X, Sparkles, Globe, Briefcase, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TOTAL_STEPS = 4; // intro + 3 steps

const CommunityProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, edition } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0); // 0 = intro
  const [loading, setLoading] = useState(false);

  // Form state
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [intro, setIntro] = useState('');
  const [occupations, setOccupations] = useState<string[]>([]);
  const [openToRemote, setOpenToRemote] = useState(false);
  const [availableForHire, setAvailableForHire] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioType, setPortfolioType] = useState('Portfolio');

  // Load existing data
  const { data: existing } = useQuery({
    queryKey: ['my-community-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('collaborator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existing) {
      setTagline(existing.tagline || '');
      setAbout(existing.about || '');
      setIntro(existing.intro || '');
      setOccupations(existing.occupations || []);
      setOpenToRemote(existing.open_to_remote || false);
      setAvailableForHire(existing.available_for_hire || false);
      setPortfolioUrl(existing.portfolio_url || '');
      setPortfolioType(existing.portfolio_type || 'Portfolio');
    }
  }, [existing]);

  const handlePublish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('collaborator_profiles')
        .upsert({
          user_id: user.id,
          tagline: tagline.trim() || null,
          about: about.trim() || null,
          intro: intro.trim() || null,
          occupations,
          open_to_remote: openToRemote,
          available_for_hire: availableForHire,
          portfolio_url: portfolioUrl.trim() || null,
          portfolio_type: portfolioType || null,
          is_published: true,
        }, { onConflict: 'user_id' });
      if (error) throw error;
      toast.success('Creative profile published!');
      queryClient.invalidateQueries({ queryKey: ['creatives-directory'] });
      queryClient.invalidateQueries({ queryKey: ['has-collaborator-profile'] });
      navigate('/community', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else handlePublish();
  };
  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else navigate(-1);
  };

  const canProceed = () => {
    if (step === 0) return true; // intro
    if (step === 1) return tagline.trim().length > 0; // basics
    if (step === 2) return occupations.length > 0; // professional
    return true; // connect
  };

  const portfolioTypes = ['Portfolio', 'Reel', 'Website', 'YouTube'];

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-forge-orange/5 blur-[120px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-2 pb-1">
        <button onClick={handleBack} className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-secondary/80 transition-all">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground">Community Profile</p>
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-secondary/80 transition-all">
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Card stack */}
      <div className="relative z-10 flex-1 flex items-center px-4 pb-20 max-w-xl mx-auto w-full min-h-0">
        <KYFormCardStack currentStep={step} totalSteps={TOTAL_STEPS}>
          {/* Intro */}
          <KYFormCard currentStep={step + 1} totalSteps={TOTAL_STEPS}>
            <div className="space-y-5 py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">Set up your creative profile</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Let the community know who you are, what you do, and how to collaborate with you. Takes about 2 minutes.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                {[
                  { emoji: '✨', text: 'Your tagline and intro' },
                  { emoji: '🎬', text: 'Your roles and skills' },
                  { emoji: '🔗', text: 'Portfolio and availability' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/30">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </KYFormCard>

          {/* Step 1: Basics */}
          <KYFormCard currentStep={step + 1} totalSteps={TOTAL_STEPS}>
            <div className="space-y-4 py-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">The Basics</h3>
                <p className="text-xs text-muted-foreground mt-1">Your cinematic elevator pitch</p>
              </div>
              <FloatingInput label="Full Name" value={profile?.full_name || ''} disabled className="opacity-60 bg-secondary/50" />
              <FloatingInput label="City" value={profile?.city || ''} disabled className="opacity-60 bg-secondary/50" />
              <div className="space-y-1">
                <FloatingTextarea
                  label="Tagline — the soul of your story *"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value.slice(0, 100))}
                  className="min-h-[70px] bg-secondary/50"
                />
                <p className="text-[11px] text-muted-foreground text-right">{tagline.length}/100</p>
              </div>
              <div className="space-y-1">
                <FloatingTextarea
                  label="Quick intro — what do you do?"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value.slice(0, 100))}
                  className="min-h-[60px] bg-secondary/50"
                />
                <p className="text-[11px] text-muted-foreground text-right">{intro.length}/100</p>
              </div>
            </div>
          </KYFormCard>

          {/* Step 2: Professional */}
          <KYFormCard currentStep={step + 1} totalSteps={TOTAL_STEPS}>
            <div className="space-y-4 py-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">Your Professional Soul</h3>
                <p className="text-xs text-muted-foreground mt-1">Select what you do — up to 4 roles</p>
              </div>
              <OccupationPillSelector selected={occupations} onChange={setOccupations} />
              {edition && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-border/30 bg-card/50">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{edition.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{edition.city}</span>
                </div>
              )}
              <div className="space-y-1">
                <FloatingTextarea
                  label="About your work"
                  value={about}
                  onChange={(e) => setAbout(e.target.value.slice(0, 500))}
                  className="min-h-[80px] bg-secondary/50"
                />
                <p className="text-[11px] text-muted-foreground text-right">{about.length}/500</p>
              </div>
            </div>
          </KYFormCard>

          {/* Step 3: Connect */}
          <KYFormCard currentStep={step + 1} totalSteps={TOTAL_STEPS}>
            <div className="space-y-4 py-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">Connect & Share</h3>
                <p className="text-xs text-muted-foreground mt-1">Let people know how to reach you</p>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-card/50">
                <div>
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Available for hire
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Show a badge on your profile</p>
                </div>
                <Switch checked={availableForHire} onCheckedChange={setAvailableForHire} />
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-card/50">
                <div>
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Open to remote
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Collaborate from anywhere</p>
                </div>
                <Switch checked={openToRemote} onCheckedChange={setOpenToRemote} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Portfolio Link</p>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {portfolioTypes.map(t => (
                    <button key={t} onClick={() => setPortfolioType(t)}
                      className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium border shrink-0 active:scale-95 transition-all',
                        portfolioType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/30'
                      )}>
                      {t}
                    </button>
                  ))}
                </div>
                <FloatingInput
                  label={`${portfolioType} URL`}
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-secondary/50"
                />
              </div>
            </div>
          </KYFormCard>
        </KYFormCardStack>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-3 pb-4 px-4 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {step > 0 && (
            <button onClick={handleBack} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3">
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={cn(
              'h-11 px-10 rounded-full text-sm font-bold transition-all',
              'bg-[#FCF7EF] text-[#1a1a1a]',
              'hover:bg-[#f5eddf] active:scale-[0.97]',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> :
              step === 0 ? "Let's go →" :
              step === TOTAL_STEPS - 1 ? 'Publish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityProfileForm;
