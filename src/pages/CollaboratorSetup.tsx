import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CollaboratorStepIndicator } from '@/components/community/CollaboratorStepIndicator';
import { OccupationPillSelector } from '@/components/community/OccupationPillSelector';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Sparkles, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface WorkItem {
  title: string;
  work_type: string;
  year: string;
  description: string;
}

const EMPTY_WORK: WorkItem = { title: '', work_type: '', year: '', description: '' };

export default function CollaboratorSetup() {
  const navigate = useNavigate();
  const { user, profile, edition } = useAuth();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);

  // Step 1 - Identity
  const [intro, setIntro] = useState('');
  const [openToRemote, setOpenToRemote] = useState(false);

  // Step 2 - Craft
  const [occupations, setOccupations] = useState<string[]>([]);

  // Step 3 - Work
  const [works, setWorks] = useState<WorkItem[]>([{ ...EMPTY_WORK }]);

  // Step 4 - Forge
  const [confirmedEdition, setConfirmedEdition] = useState(false);

  // Check if user already has a collaborator profile
  const { data: existingProfile } = useQuery({
    queryKey: ['my-collaborator-profile', user?.id],
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

  const { data: existingWorks } = useQuery({
    queryKey: ['my-collaborator-works', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('collaborator_works')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index');
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch edition details
  const { data: editionData } = useQuery({
    queryKey: ['edition-detail', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return null;
      const { data } = await supabase
        .from('editions')
        .select('*')
        .eq('id', profile.edition_id)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.edition_id,
  });

  // Pre-fill from existing data
  useEffect(() => {
    if (existingProfile) {
      setIntro(existingProfile.intro || '');
      setOpenToRemote(existingProfile.open_to_remote || false);
      setOccupations(existingProfile.occupations || []);
    }
  }, [existingProfile]);

  useEffect(() => {
    if (existingWorks && existingWorks.length > 0) {
      setWorks(existingWorks.map(w => ({
        title: w.title,
        work_type: w.work_type || '',
        year: w.year || '',
        description: w.description || '',
      })));
    }
  }, [existingWorks]);

  const addWork = () => {
    if (works.length < 4) setWorks([...works, { ...EMPTY_WORK }]);
  };

  const removeWork = (index: number) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const updateWork = (index: number, field: keyof WorkItem, value: string) => {
    const updated = [...works];
    updated[index] = { ...updated[index], [field]: value };
    setWorks(updated);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return intro.trim().length > 0;
      case 1: return occupations.length > 0;
      case 2: return works.some(w => w.title.trim().length > 0);
      case 3: return true;
      default: return false;
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);

    try {
      // Upsert collaborator profile
      const { error: profileError } = await supabase
        .from('collaborator_profiles')
        .upsert({
          user_id: user.id,
          intro: intro.trim(),
          occupations,
          open_to_remote: openToRemote,
          is_published: true,
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Delete existing works and re-insert
      await supabase.from('collaborator_works').delete().eq('user_id', user.id);

      const validWorks = works.filter(w => w.title.trim());
      if (validWorks.length > 0) {
        const { error: worksError } = await supabase
          .from('collaborator_works')
          .insert(validWorks.map((w, i) => ({
            user_id: user.id,
            title: w.title.trim(),
            work_type: w.work_type.trim() || null,
            year: w.year.trim() || null,
            description: w.description.trim() || null,
            order_index: i,
          })));
        if (worksError) throw worksError;
      }

      toast.success('Network profile published!');
      navigate('/community?tab=network');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish profile');
    } finally {
      setPublishing(false);
    }
  };

  const cohortColor = editionData?.cohort_type === 'FORGE'
    ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    : editionData?.cohort_type === 'FORGE_CREATORS'
      ? 'text-pink-400 bg-pink-400/10 border-pink-400/30'
      : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <CollaboratorStepIndicator currentStep={step} />
        </div>

        {/* Step 1: Identity */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Who are you?</h1>
              <p className="text-sm text-muted-foreground mt-1">Tell the community about yourself</p>
            </div>

            <div className="space-y-4">
              <FloatingInput
                label="Full Name"
                value={profile?.full_name || ''}
                disabled
                className="opacity-60"
              />
              <FloatingInput
                label="City"
                value={profile?.city || ''}
                disabled
                className="opacity-60"
              />
              <div className="space-y-1.5">
                <FloatingTextarea
                  label="Your intro — what do you do?"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value.slice(0, 100))}
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground text-right">{intro.length}/100</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30">
                <div>
                  <Label className="text-sm font-medium text-foreground">Open to remote work</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Let others know you can collaborate remotely</p>
                </div>
                <Switch checked={openToRemote} onCheckedChange={setOpenToRemote} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Craft */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your craft</h1>
              <p className="text-sm text-muted-foreground mt-1">Select what you do — up to 4 roles</p>
            </div>
            <OccupationPillSelector selected={occupations} onChange={setOccupations} />
          </div>
        )}

        {/* Step 3: Work */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your work</h1>
              <p className="text-sm text-muted-foreground mt-1">Showcase up to 4 projects</p>
            </div>
            <div className="space-y-4">
              {works.map((work, index) => (
                <Card key={index} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Project {index + 1}</span>
                      {works.length > 1 && (
                        <button onClick={() => removeWork(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <FloatingInput label="Title" value={work.title} onChange={(e) => updateWork(index, 'title', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <FloatingInput label="Type (e.g. Short Film)" value={work.work_type} onChange={(e) => updateWork(index, 'work_type', e.target.value)} />
                      <FloatingInput label="Year" value={work.year} onChange={(e) => updateWork(index, 'year', e.target.value)} />
                    </div>
                    <FloatingTextarea label="Brief description" value={work.description} onChange={(e) => updateWork(index, 'description', e.target.value)} className="min-h-[60px]" />
                  </CardContent>
                </Card>
              ))}
              {works.length < 4 && (
                <button
                  onClick={addWork}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add another project
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Forge */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Forge</h1>
              <p className="text-sm text-muted-foreground mt-1">Confirm your edition</p>
            </div>

            {editionData ? (
              <Card className={`border ${cohortColor.split(' ').filter(c => c.startsWith('border-')).join(' ')} bg-card/50`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-5 h-5 ${cohortColor.split(' ').filter(c => c.startsWith('text-')).join(' ')}`} />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pre-assigned</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{editionData.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{editionData.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{editionData.cohort_type.replace('_', ' ')}</span>
                  </div>
                  <label className="flex items-center gap-3 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedEdition}
                      onChange={(e) => setConfirmedEdition(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">Yes, I attended this edition</span>
                  </label>
                </CardContent>
              </Card>
            ) : (
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 text-center">
                <p className="text-sm text-muted-foreground">No edition assigned to your profile yet.</p>
                <p className="text-xs text-muted-foreground mt-1">You can still publish — your edition will show once assigned.</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 gap-2"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Publish Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
