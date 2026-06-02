import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import forgeLogo from '@/assets/forge-logo.png';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Briefcase,
  Globe,
  Link as LinkIcon,
  X,
  Sparkles,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';

// Mirrors the seeded `collaborator_occupations` table
const OCCUPATIONS = [
  'Photographer',
  'Cinematographer',
  'Editor',
  'Director',
  'Colorist',
  'Writer',
  'Illustrator',
  'Animator',
  'Sound Designer',
  'Producer',
];

const PORTFOLIO_TYPES = ['Portfolio', 'Reel', 'Website', 'YouTube', 'Instagram', 'Vimeo', 'Behance'] as const;
type PortfolioType = typeof PORTFOLIO_TYPES[number];

type PortfolioLink = { id: string; type: PortfolioType; url: string };

type FormData = {
  avatar_url: string | null;
  full_name: string;
  city: string;
  tagline: string;
  intro: string;
  occupations: string[];
  about: string;
  available_for_hire: boolean;
  open_to_remote: boolean;
  portfolio_links: PortfolioLink[];
};

const INITIAL_DATA: FormData = {
  avatar_url: null,
  full_name: '',
  city: '',
  tagline: '',
  intro: '',
  occupations: [],
  about: '',
  available_for_hire: false,
  open_to_remote: false,
  portfolio_links: [],
};

const placeholderFor = (type: PortfolioType): string => {
  switch (type) {
    case 'YouTube': return 'youtube.com/@yourhandle';
    case 'Reel': return 'vimeo.com/your-reel';
    case 'Website': return 'yourname.com';
    case 'Instagram': return 'instagram.com/yourhandle';
    case 'Vimeo': return 'vimeo.com/yourhandle';
    case 'Behance': return 'behance.net/yourhandle';
    default: return 'yourportfolio.com';
  }
};

const STEPS = ['welcome', 'basics', 'professional', 'connect', 'review'] as const;
type StepKey = typeof STEPS[number];

// ---------- Page ----------
const CommunityOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_DATA);

  const step: StepKey = STEPS[stepIdx];
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  // Per-step validity for the primary action
  const canAdvance = useMemo(() => {
    switch (step) {
      case 'welcome': return true;
      case 'basics': return data.full_name.trim().length > 0 && data.city.trim().length > 0 && data.tagline.trim().length >= 4;
      case 'professional': return data.occupations.length > 0;
      case 'connect': return true;
      case 'review': return true;
    }
  }, [step, data]);

  const next = () => setStepIdx(i => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIdx(i => Math.max(0, i - 1));

  const { user, profile } = useAuth();

  // Pre-fill from existing profile data
  const { data: existingCollab } = useQuery({
    queryKey: ['my-collab-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborator_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!profile && !existingCollab) return;
    setData(prev => {
      if (prev.full_name || prev.city || prev.tagline) return prev;
      return {
        ...prev,
        full_name: profile?.full_name || prev.full_name,
        city: profile?.city || prev.city,
        avatar_url: (profile as any)?.avatar_url || prev.avatar_url,
        tagline: existingCollab?.tagline || (profile as any)?.tagline || prev.tagline,
        intro: existingCollab?.intro || prev.intro,
        about: (existingCollab as any)?.about || prev.about,
        occupations: existingCollab?.occupations || ((profile as any)?.specialty ? [(profile as any).specialty] : prev.occupations),
        available_for_hire: existingCollab?.available_for_hire ?? prev.available_for_hire,
        open_to_remote: existingCollab?.open_to_remote ?? prev.open_to_remote,
        portfolio_links: existingCollab?.portfolio_url
          ? [{ type: 'Portfolio' as any, url: existingCollab.portfolio_url }]
          : prev.portfolio_links,
      };
    });
  }, [profile, existingCollab]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // --- 1. Upload avatar if user picked a new file (blob: URL) ---
      let finalAvatarUrl: string | null = data.avatar_url;
      if (data.avatar_url?.startsWith('blob:')) {
        try {
          const blob = await fetch(data.avatar_url).then(r => r.blob());
          const ext = blob.type.split('/')[1] || 'jpg';
          const path = `${user.id}/avatar.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('avatars')
            .upload(path, blob, { upsert: true, contentType: blob.type });
          if (!upErr) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            finalAvatarUrl = urlData.publicUrl;
          }
          URL.revokeObjectURL(data.avatar_url);
        } catch {
          // Avatar upload failed — continue without it, don't block save
          finalAvatarUrl = (profile as any)?.avatar_url ?? null;
        }
      }

      // --- 2. Upsert collaborator_profiles (ALL fields) ---
      const { error: cpError } = await supabase
        .from('collaborator_profiles')
        .upsert({
          user_id: user.id,
          tagline: data.tagline,
          intro: data.intro,
          occupations: data.occupations,
          about: data.about,
          portfolio_url: data.portfolio_links[0]?.url ?? null,
          is_published: true,
          available_for_hire: data.available_for_hire,
          open_to_remote: data.open_to_remote,
        }, { onConflict: 'user_id' });
      if (cpError) throw cpError;

      // --- 3. Update profiles table ---
      // tagline + bio are mirrored here so the main /profile page
      // reflects whatever the student fills in the community onboarding.
      const profileUpdate: Record<string, any> = {};
      if (data.full_name.trim()) profileUpdate.full_name = data.full_name.trim();
      if (data.city.trim())      profileUpdate.city      = data.city.trim();
      if (finalAvatarUrl)        profileUpdate.avatar_url = finalAvatarUrl;
      // Mirror community fields → main profile page fields
      if (data.tagline.trim())   profileUpdate.tagline   = data.tagline.trim();
      if (data.about.trim())     profileUpdate.bio       = data.about.trim();
      if (data.intro.trim())     profileUpdate.bio       = data.intro.trim(); // intro is shorter, prefer it for the bio pill
      if (Object.keys(profileUpdate).length > 0) {
        const { error: pError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id);
        if (pError) throw pError;
      }
    },
    onSuccess: () => {
      toast.success("Profile saved! You're now in the community directory.");
      navigate('/community');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save profile');
    },
  });

  const finish = () => saveMutation.mutate();

  // Progress dots — skip welcome and review from the count (they're framing)
  const totalNumbered = 3;
  const currentNumbered =
    step === 'basics' ? 1 :
    step === 'professional' ? 2 :
    step === 'connect' ? 3 :
    step === 'review' ? 3 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 sm:p-6 text-foreground font-sans antialiased">
      {/* Subtle ambient amber from edges */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(41_100%_62%/0.10),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(27_85%_48%/0.08),transparent_70%)] blur-3xl" />
      </div>

      {/* Modal */}
      <div className="relative flex h-[min(760px,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Top bar inside modal */}
        <TopBar
          onExit={() => navigate('/community')}
          showProgress={step !== 'welcome'}
          current={currentNumbered}
          total={totalNumbered}
        />

        {/* Split body: form left, live preview right */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
            {step === 'welcome' && <WelcomeStep onStart={next} />}
            {step === 'basics' && <BasicsStep data={data} update={update} />}
            {step === 'professional' && <ProfessionalStep data={data} update={update} />}
            {step === 'connect' && <ConnectStep data={data} update={update} />}
            {step === 'review' && <ReviewStep data={data} onEdit={(i) => setStepIdx(i)} />}
          </main>

          {/* Live preview side */}
          <aside className="border-t border-border/40 lg:border-t-0 lg:border-l lg:w-[360px] xl:w-[400px] overflow-y-auto bg-[radial-gradient(at_top_right,hsl(41_100%_62%/0.08),transparent_60%)]">
            <LivePreview data={data} step={step} />
          </aside>
        </div>

        {/* Bottom action bar inside modal */}
        <footer className="border-t border-border/40 bg-card">
          <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4">
            {step === 'welcome' ? (
              <span className="text-xs text-muted-foreground">Takes about 2 minutes</span>
            ) : (
              <button
                onClick={back}
                disabled={stepIdx === 0}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}

            {step === 'welcome' && (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.6)]"
              >
                Start setup <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {(step === 'basics' || step === 'professional' || step === 'connect') && (
              <button
                onClick={next}
                disabled={!canAdvance}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                  canAdvance
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.6)]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 'review' && (
              <button
                onClick={finish}
                disabled={saveMutation.isPending}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.6)]',
                  saveMutation.isPending
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {saveMutation.isPending ? 'Saving…' : 'Publish'} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

// ---------- Top bar ----------
const TopBar: React.FC<{ onExit: () => void; showProgress: boolean; current: number; total: number }> = ({ onExit, showProgress, current, total }) => (
  <header className="flex items-center justify-between gap-3 border-b border-border/40 px-6 sm:px-8 py-4">
    <Link to="/community" className="flex items-center">
      <img src={forgeLogo} alt="The Forge" className="h-6 w-auto" />
    </Link>
    {showProgress ? (
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="tabular-nums text-foreground">{current}<span className="text-muted-foreground/50">/{total}</span></span>
        <div className="ml-1 flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 w-5 rounded-full transition-colors',
                i + 1 <= current ? 'bg-primary shadow-[0_0_6px_hsl(41_100%_62%/0.6)]' : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>
    ) : <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Profile setup</span>}
    <button
      onClick={onExit}
      aria-label="Exit setup"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </header>
);

// ---------- Step 0 · Welcome ----------
const WelcomeStep: React.FC<{ onStart: () => void }> = () => (
  <div className="flex flex-col items-center text-center">
    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-primary/80">
      <span className="h-px w-8 bg-primary/40" /> Welcome back
    </div>

    <h1 className="mt-4 text-[40px] sm:text-[48px] leading-[0.95] tracking-tight text-foreground">
      Welcome to
      <br />
      <span className="italic text-primary">The Circle</span>.
    </h1>

    <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
      Set up your creative profile — so other Forge alumni can find you, hire you, and ship work with you.
    </p>

    <div className="mt-7 grid grid-cols-3 gap-2 w-full">
      <Pillar emoji="✨" label="Step 1" title="The basics" />
      <Pillar emoji="🎬" label="Step 2" title="Your craft" />
      <Pillar emoji="🔗" label="Step 3" title="Connect & share" />
    </div>

    <p className="mt-6 text-[11px] text-muted-foreground">
      Editable later from your profile.
    </p>
  </div>
);

const Pillar: React.FC<{ emoji: string; label: string; title: string }> = ({ emoji, label, title }) => (
  <div className="rounded-xl border border-border/40 bg-background/40 p-3 text-left">
    <div className="text-lg">{emoji}</div>
    <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-primary/80">{label}</div>
    <div className="mt-0.5 text-xs font-medium text-foreground leading-tight">{title}</div>
  </div>
);

// ---------- Step 1 · Basics ----------
const BasicsStep: React.FC<{ data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }> = ({ data, update }) => (
  <StepLayout
    eyebrow="01 · The basics"
    title={<>Your cinematic<br /><span className="italic text-primary">elevator pitch</span>.</>}
    subtitle="Two short lines other creatives will read first when they land on your card."
  >
    <AvatarUpload
      value={data.avatar_url}
      fallbackInitials={data.full_name}
      onChange={(url) => update('avatar_url', url)}
    />

    <TextField
      label="Full name"
      placeholder="Your full name"
      value={data.full_name}
      onChange={(v) => update('full_name', v)}
      icon={<ForgeMark />}
    />
    <TextField
      label="City"
      placeholder="Where you're based"
      value={data.city}
      onChange={(v) => update('city', v)}
      icon={<MapPin className="h-3.5 w-3.5" />}
    />

    <TextareaField
      label="Tagline"
      required
      hint="The soul of your story — one sentence."
      placeholder="e.g. Directing intimate documentaries about Indian craft."
      value={data.tagline}
      maxLength={100}
      onChange={(v) => update('tagline', v.slice(0, 100))}
      rows={2}
    />

    <TextareaField
      label="Quick intro"
      hint="What do you do, in plain words?"
      placeholder="e.g. Mumbai-based filmmaker; mostly docs, some ads."
      value={data.intro}
      maxLength={100}
      onChange={(v) => update('intro', v.slice(0, 100))}
      rows={2}
    />
  </StepLayout>
);

// ---------- Step 2 · Professional ----------
const ProfessionalStep: React.FC<{ data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }> = ({ data, update }) => {
  const toggle = (occ: string) => {
    if (data.occupations.includes(occ)) {
      update('occupations', data.occupations.filter(o => o !== occ));
    } else if (data.occupations.length < 4) {
      update('occupations', [...data.occupations, occ]);
    }
  };

  return (
    <StepLayout
      eyebrow="02 · Your craft"
      title={<>What do you <span className="italic text-primary">do</span>?</>}
      subtitle="Pick up to four roles. These power the directory filters and how others find you."
    >
      <div>
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Roles</label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {data.occupations.length}<span className="text-muted-foreground/50">/4</span>
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {OCCUPATIONS.map(o => {
            const selected = data.occupations.includes(o);
            const disabled = !selected && data.occupations.length >= 4;
            return (
              <button
                key={o}
                onClick={() => toggle(o)}
                disabled={disabled}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_hsl(41_100%_62%/0.5)]'
                    : disabled
                      ? 'border-border/30 text-muted-foreground/40 cursor-not-allowed'
                      : 'border-border/50 text-foreground hover:border-primary/60 hover:text-primary'
                )}
              >
                {selected && <Check className="mr-1 inline h-3 w-3" />}
                {o}
              </button>
            );
          })}
        </div>
      </div>

      <TextareaField
        label="About your work"
        hint="A short paragraph — what you make, who you make it with, what you're known for."
        placeholder="I make documentaries about Indian craft. I shoot, direct, and occasionally cut my own work. Comfortable on long shoots, small crews, festival-track films…"
        value={data.about}
        maxLength={500}
        onChange={(v) => update('about', v.slice(0, 500))}
        rows={5}
      />
    </StepLayout>
  );
};

// ---------- Step 3 · Connect ----------
const ConnectStep: React.FC<{ data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }> = ({ data, update }) => (
  <StepLayout
    eyebrow="03 · Connect & share"
    title={<>How can people <span className="italic text-primary">reach you</span>?</>}
    subtitle="Let collaborators know when you're open, and where to see your work."
  >
    <ToggleRow
      icon={<Briefcase className="h-4 w-4" />}
      title="Available for hire"
      subtitle="Show a glowing badge on your card and profile."
      checked={data.available_for_hire}
      onChange={(v) => update('available_for_hire', v)}
    />
    <ToggleRow
      icon={<Globe className="h-4 w-4" />}
      title="Open to remote work"
      subtitle="Collaborate from anywhere — Forge or not."
      checked={data.open_to_remote}
      onChange={(v) => update('open_to_remote', v)}
    />

    <PortfolioLinksField
      links={data.portfolio_links}
      onChange={(links) => update('portfolio_links', links)}
    />
  </StepLayout>
);

// ---------- Step 4 · Review ----------
const ReviewStep: React.FC<{ data: FormData; onEdit: (idx: number) => void }> = ({ data, onEdit }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Almost there</div>
    <h1 className="mt-2 text-[32px] sm:text-[38px] leading-[1.02] tracking-tight text-foreground">
      Almost <span className="italic text-primary">there</span>.
    </h1>
    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
      The live preview on the right is exactly how you&apos;ll appear in the Circle. Edit any section here, or hit publish.
    </p>

    {/* Section recaps */}
    <div className="mt-7 space-y-2.5">
      <RecapRow label="The basics" onEdit={() => onEdit(1)}>
        <p className="text-sm text-foreground">{data.tagline || <em className="text-muted-foreground/60">No tagline yet</em>}</p>
        {data.intro && <p className="mt-1 text-xs text-muted-foreground">{data.intro}</p>}
      </RecapRow>

      <RecapRow label="Your craft" onEdit={() => onEdit(2)}>
        <div className="flex flex-wrap gap-1.5">
          {data.occupations.length === 0
            ? <em className="text-xs text-muted-foreground/60">No roles selected</em>
            : data.occupations.map(o => (
                <span key={o} className="rounded-full border border-border/50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{o}</span>
              ))}
        </div>
        {data.about && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{data.about}</p>}
      </RecapRow>

      <RecapRow label="Connect & share" onEdit={() => onEdit(3)}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {data.available_for_hire && <Chip>For hire</Chip>}
          {data.open_to_remote && <Chip>Open to remote</Chip>}
        </div>
        {data.portfolio_links.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {data.portfolio_links.map(l => (
              <li key={l.id} className="flex items-center gap-2 text-xs">
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-primary">{l.type}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="truncate text-foreground">{l.url}</span>
              </li>
            ))}
          </ul>
        ) : (!data.available_for_hire && !data.open_to_remote) ? (
          <p className="mt-2 text-xs"><em className="text-muted-foreground/60">Nothing set yet</em></p>
        ) : null}
      </RecapRow>
    </div>
  </div>
);

const RecapRow: React.FC<{ label: string; onEdit: () => void; children: React.ReactNode }> = ({ label, onEdit, children }) => (
  <div className="group relative rounded-2xl border border-border/40 bg-card/40 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{label}</div>
      <button
        onClick={onEdit}
        className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
      >
        Edit
      </button>
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">
    <span className="h-1 w-1 rounded-full bg-primary" />
    {children}
  </span>
);

// ---------- Live preview side panel ----------
const LivePreview: React.FC<{ data: FormData; step: StepKey }> = ({ data, step }) => {
  const hl = (target: StepKey) => step === target;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Live preview</div>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(41_100%_62%)]" />
          Updating
        </div>
      </div>

      {/* The directory card */}
      <div className="flex justify-center">
        <PreviewCard data={data} />
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        How you&apos;ll appear in the Circle directory.
      </p>

      {/* Section: tagline + intro */}
      <PreviewSection
        label="Tagline & intro"
        active={hl('basics')}
        empty={!data.tagline && !data.intro}
        emptyHint="Your tagline appears here once you fill it in."
      >
        {data.tagline && (
          <p className="italic text-sm leading-snug text-foreground/90 border-l-2 border-primary/70 pl-3">
            “{data.tagline}”
          </p>
        )}
        {data.intro && (
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{data.intro}</p>
        )}
      </PreviewSection>

      {/* Section: roles + about */}
      <PreviewSection
        label="Craft & story"
        active={hl('professional')}
        empty={data.occupations.length === 0 && !data.about}
        emptyHint="Pick your roles to see them appear on the card."
      >
        {data.occupations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.occupations.map(o => (
              <span key={o} className="rounded-full border border-border/50 bg-background/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {o}
              </span>
            ))}
          </div>
        )}
        {data.about && (
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-4">{data.about}</p>
        )}
      </PreviewSection>

      {/* Section: status + links */}
      <PreviewSection
        label="Status & links"
        active={hl('connect')}
        empty={!data.available_for_hire && !data.open_to_remote && data.portfolio_links.length === 0}
        emptyHint="Add a status or a link to make your profile more discoverable."
      >
        <div className="flex flex-wrap gap-1.5">
          {data.available_for_hire && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">
              <span className="h-1 w-1 rounded-full bg-primary" /> For hire
            </span>
          )}
          {data.open_to_remote && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/70" /> Open to remote
            </span>
          )}
        </div>
        {data.portfolio_links.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {data.portfolio_links.map(l => (
              <li key={l.id} className="flex items-center gap-2 text-xs">
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-primary">{l.type}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="truncate text-foreground">{l.url}</span>
              </li>
            ))}
          </ul>
        )}
      </PreviewSection>
    </div>
  );
};

const PreviewSection: React.FC<{
  label: string;
  active: boolean;
  empty: boolean;
  emptyHint: string;
  children: React.ReactNode;
}> = ({ label, active, empty, emptyHint, children }) => (
  <section
    className={cn(
      'rounded-2xl border bg-card/40 p-4 transition-all',
      active ? 'border-primary/50 bg-primary/[0.04] shadow-[inset_2px_0_0_hsl(41_100%_62%/0.7)]' : 'border-border/40'
    )}
  >
    <div className="flex items-center justify-between">
      <div className={cn('text-[10px] uppercase tracking-[0.18em]', active ? 'text-primary' : 'text-muted-foreground')}>
        {label}
      </div>
      {active && <span className="text-[9px] uppercase tracking-[0.18em] text-primary/70">Editing</span>}
    </div>
    <div className="mt-3">
      {empty ? (
        <p className="text-[11px] italic text-muted-foreground/60 leading-relaxed">{emptyHint}</p>
      ) : (
        children
      )}
    </div>
  </section>
);

// ---------- Preview card (mirrors the Circle directory card) ----------
const PreviewCard: React.FC<{ data: FormData }> = ({ data }) => {
  const initials = data.full_name.trim()
    ? data.full_name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <article className="relative aspect-[4/5] w-[200px] overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-background">
      {/* Portrait area — uploaded image or placeholder */}
      {data.avatar_url ? (
        <img src={data.avatar_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          {initials ? (
            <span className="text-5xl font-light text-primary/60">{initials}</span>
          ) : (
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground/50">Your photo</span>
          )}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
      {data.available_for_hire && (
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(41_100%_62%)]" />
          For hire
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className={cn(
          'text-[10px] uppercase tracking-[0.16em] font-medium truncate',
          data.occupations.length > 0 ? 'text-primary' : 'text-white/50'
        )}>
          {data.occupations.length > 0 ? data.occupations.join(' · ') : 'Your craft'}
        </div>
        <h3 className={cn(
          'mt-1 text-2xl font-semibold leading-tight truncate',
          data.full_name ? 'text-white' : 'text-white/40'
        )}>
          {data.full_name || 'Your name'}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <MapPin className="h-3 w-3 text-white/60" />
          <span className={data.city ? 'text-white/70' : 'text-white/40'}>
            {data.city || 'Your city'}
          </span>
        </div>
      </div>
    </article>
  );
};

// ---------- Reusable bits ----------
const StepLayout: React.FC<{ eyebrow: string; title: React.ReactNode; subtitle: string; children: React.ReactNode }> = ({ eyebrow, title, subtitle, children }) => (
  <div className="space-y-6">
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{eyebrow}</div>
      <h1 className="mt-2 text-[32px] sm:text-[38px] leading-[1.02] tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

const AvatarUpload: React.FC<{
  value: string | null;
  fallbackInitials: string;
  onChange: (url: string | null) => void;
}> = ({ value, fallbackInitials, onChange }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const initials = fallbackInitials.trim()
    ? fallbackInitials.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    // Local-only preview URL (revoke previous if it was a blob)
    if (value && value.startsWith('blob:')) URL.revokeObjectURL(value);
    onChange(URL.createObjectURL(file));
  };

  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5" /> Profile photo
      </label>

      <div className="mt-3 flex items-center gap-4">
        {/* Avatar tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-card/40 transition-colors hover:border-primary/60"
          aria-label={value ? 'Change photo' : 'Upload photo'}
        >
          {value ? (
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-primary">
              {initials ? (
                <span className="text-2xl font-light">{initials}</span>
              ) : (
                <Upload className="h-5 w-5 opacity-70" />
              )}
            </div>
          )}
          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </button>

        {/* Upload actions */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              {value ? 'Change' : 'Upload photo'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  if (value.startsWith('blob:')) URL.revokeObjectURL(value);
                  onChange(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground/70 leading-relaxed">
            Square works best · JPG / PNG · up to 5 MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

const TextField: React.FC<{ label: string; placeholder?: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }> = ({ label, placeholder, value, onChange, icon }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1.5">
      {icon && <span>{icon}</span>}
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-2xl border border-border/40 bg-card/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors"
    />
  </div>
);

const TextareaField: React.FC<{
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  maxLength: number;
  onChange: (v: string) => void;
  required?: boolean;
  rows?: number;
}> = ({ label, hint, placeholder, value, maxLength, onChange, required, rows = 3 }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <span className="text-[11px] tabular-nums text-muted-foreground/60">
        {value.length}<span className="text-muted-foreground/40">/{maxLength}</span>
      </span>
    </div>
    {hint && <p className="mt-1.5 text-xs text-muted-foreground/80">{hint}</p>}
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="mt-3 w-full resize-none rounded-2xl border border-border/40 bg-card/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors"
    />
  </div>
);

const PortfolioLinksField: React.FC<{
  links: PortfolioLink[];
  onChange: (links: PortfolioLink[]) => void;
}> = ({ links, onChange }) => {
  const [draftType, setDraftType] = useState<PortfolioType>('Portfolio');
  const [draftUrl, setDraftUrl] = useState('');

  const addLink = () => {
    const trimmed = draftUrl.trim();
    if (!trimmed) return;
    onChange([
      ...links,
      { id: Math.random().toString(36).slice(2, 9), type: draftType, url: trimmed },
    ]);
    setDraftUrl('');
  };

  const removeLink = (id: string) => onChange(links.filter(l => l.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Portfolio links</label>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground/70">{links.length} added</span>
      </div>

      {/* Existing links */}
      {links.length > 0 && (
        <ul className="mt-3 space-y-2">
          {links.map(l => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 px-3.5 py-2.5"
            >
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">
                {l.type}
              </span>
              <span className="flex-1 min-w-0 truncate text-sm text-foreground">{l.url}</span>
              <button
                onClick={() => removeLink(l.id)}
                aria-label={`Remove ${l.type} link`}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new link row */}
      <div className="mt-3 rounded-2xl border border-dashed border-border/50 bg-card/30 p-3">
        <div className="flex flex-wrap gap-1.5">
          {PORTFOLIO_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setDraftType(t)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                draftType === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex gap-2">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
            placeholder={placeholderFor(draftType)}
            className="flex-1 min-w-0 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors"
          />
          <button
            onClick={addLink}
            disabled={!draftUrl.trim()}
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
              draftUrl.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <PlusIcon /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const PlusIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ToggleRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ icon, title, subtitle, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      'w-full text-left rounded-2xl border p-4 transition-all flex items-center gap-4',
      checked
        ? 'border-primary/50 bg-primary/5'
        : 'border-border/40 bg-card/40 hover:border-primary/30'
    )}
  >
    <div className={cn(
      'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
      checked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
    )}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-base font-medium text-foreground">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
    </div>
    <div className={cn(
      'h-6 w-11 rounded-full p-0.5 transition-colors',
      checked ? 'bg-primary' : 'bg-border'
    )}>
      <span className={cn(
        'block h-5 w-5 rounded-full bg-background shadow-md transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </div>
  </button>
);

const ForgeMark: React.FC = () => (
  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary" aria-hidden>F</span>
);

export default CommunityOnboarding;
