import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import forgeLogo from '@/assets/forge-logo.png';
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Check,
  ChevronDown,
  MapPin,
  Star,
  X,
  Clock,
} from 'lucide-react';


// --- Options ---
const ROLE_OPTIONS = [
  'Director', 'DOP', 'Editor', 'Colorist', 'Writer', 'Producer',
  'Sound', 'Composer', 'AD', 'Designer', 'Production Designer', 'VFX',
  'Casting', 'Photographer', 'Creator', 'Podcaster',
] as const;

type WorkType = 'paid' | 'collab' | 'mentorship' | 'residency';
const WORK_TYPES: Array<{ value: WorkType; label: string; helper: string }> = [
  { value: 'paid', label: 'Paid', helper: 'A day-rate or flat fee' },
  { value: 'collab', label: 'Collab', helper: 'Credit, profit share, or barter' },
  { value: 'mentorship', label: 'Mentorship', helper: 'Time + access, no pay' },
  { value: 'residency', label: 'Residency', helper: 'Stipend + structured engagement' },
];

type Mode = 'remote' | 'hybrid' | 'onsite';
const MODES: Array<{ value: Mode; label: string; helper: string }> = [
  { value: 'remote', label: 'Remote', helper: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', helper: 'Mix of remote + in-person' },
  { value: 'onsite', label: 'Onsite', helper: 'Specific city or set' },
];

type FormData = {
  role: string;
  workType: WorkType;
  mode: Mode;
  location: string;
  title: string;
  description: string;
  budget: string;
  contact: 'message' | 'email';
};

const INITIAL_DATA: FormData = {
  role: '',
  workType: 'paid',
  mode: 'onsite',
  location: '',
  title: '',
  description: '',
  budget: '',
  contact: 'message',
};

const CommunityPostGig: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [published, setPublished] = useState(false);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(prev => ({ ...prev, [k]: v }));

  const isValid = useMemo(() => (
    data.role.trim().length > 0 &&
    data.title.trim().length >= 6 &&
    data.description.trim().length >= 20 &&
    data.budget.trim().length > 0 &&
    (data.mode === 'remote' || data.location.trim().length > 0)
  ), [data]);

  const publishMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('gigs').insert({
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        location: formData.location,
        roles_needed: formData.role ? [formData.role] : [],
        gig_type: formData.workType,
        pay_type: formData.mode,
        status: 'open',
        visibility: 'community',
        contact_info: formData.contact === 'email' ? user.email : undefined,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setPublished(true);
      toast.success('Gig posted! The Forge team will review it within 24h.');
      setTimeout(() => navigate('/community'), 1600);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to post gig');
    },
  });

  const publish = () => {
    if (!isValid) return;
    publishMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 sm:p-6 text-foreground font-sans antialiased">
      {/* Ambient amber wash */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(41_100%_62%/0.10),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(27_85%_48%/0.08),transparent_70%)] blur-3xl" />
      </div>

      {/* Modal */}
      <div className="relative flex h-[min(760px,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border/40 px-6 sm:px-8 py-4">
          <Link to="/community" className="flex items-center">
            <img src={forgeLogo} alt="The Forge" className="h-6 w-auto" />
          </Link>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" /> Post a gig
          </div>
          <button
            onClick={() => navigate('/community')}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Split body */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Left — form */}
          <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
            {!published ? (
              <FormBody data={data} update={update} profile={profile as any} />
            ) : (
              <PublishedSuccess data={data} />
            )}
          </main>

          {/* Right — live preview */}
          <aside className="border-t border-border/40 lg:border-t-0 lg:border-l lg:w-[400px] xl:w-[440px] overflow-y-auto bg-[radial-gradient(at_top_right,hsl(41_100%_62%/0.08),transparent_60%)]">
            <LivePreview data={data} profile={profile as any} />
          </aside>
        </div>

        {/* Footer */}
        {!published && (
          <footer className="border-t border-border/40 bg-card">
            <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4">
              <button
                onClick={() => navigate('/community')}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Cancel
              </button>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Verified within 24h
                </span>
                <button
                  onClick={publish}
                  disabled={!isValid || publishMutation.isPending}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                    isValid && !publishMutation.isPending
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.6)]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {publishMutation.isPending ? 'Posting…' : 'Publish gig'} <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

// ---------- Form body ----------
const FormBody: React.FC<{
  data: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  profile: any;
}> = ({ data, update, profile }) => (
  <div className="space-y-7">
    <header>
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">— Tell the community</div>
      <h1 className="mt-2 text-[32px] sm:text-[38px] leading-[1.02] tracking-tight text-foreground">
        Post a <span className="italic text-primary">gig</span>.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Other Forge alumni see your post first. Takes about a minute.
      </p>
    </header>

    {/* Posting-as banner */}
    <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/60 px-4 py-3">
      <Avatar className="h-9 w-9 ring-1 ring-border/50">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/15 text-primary text-xs">
          {(profile?.full_name || 'Y').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">Posting as <span className="font-medium">{profile?.full_name || 'You'}</span></div>
        <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
          <Star className="h-3 w-3 text-primary" /> Alumni
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-primary">
        <CheckIcon /> Verified
      </span>
    </div>

    {/* Role */}
    <FieldGroup label="01 · Who you're looking for" hint="The primary role for this gig.">
      <Dropdown
        value={data.role}
        placeholder="Pick a role…"
        options={ROLE_OPTIONS.map(r => ({ value: r, label: r }))}
        onChange={(v) => update('role', v)}
      />
    </FieldGroup>

    {/* Work type */}
    <FieldGroup label="02 · Type of engagement" hint="How you're paying — or not — for the work.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {WORK_TYPES.map(t => (
          <Choice
            key={t.value}
            active={data.workType === t.value}
            onClick={() => update('workType', t.value)}
            title={t.label}
            helper={t.helper}
          />
        ))}
      </div>
    </FieldGroup>

    {/* Mode + location */}
    <FieldGroup label="03 · Where" hint="Set the working mode and (if onsite/hybrid) the city.">
      <div className="grid grid-cols-3 gap-2">
        {MODES.map(m => (
          <Choice
            key={m.value}
            active={data.mode === m.value}
            onClick={() => update('mode', m.value)}
            title={m.label}
            helper={m.helper}
          />
        ))}
      </div>
      {data.mode !== 'remote' && (
        <div className="mt-3">
          <TextInput
            label="City / set"
            placeholder="e.g. Mumbai, Bengaluru, Kerala"
            value={data.location}
            onChange={(v) => update('location', v)}
            icon={<MapPin className="h-3.5 w-3.5" />}
          />
        </div>
      )}
    </FieldGroup>

    {/* Title + description */}
    <FieldGroup label="04 · The gig" hint="A short, scannable title and a few lines of context.">
      <TextInput
        label="Title"
        placeholder="e.g. DOP for 3-day documentary shoot in Kerala"
        value={data.title}
        onChange={(v) => update('title', v.slice(0, 80))}
        maxLength={80}
      />
      <div className="mt-3">
        <TextareaInput
          label="Description"
          placeholder="What you're shooting, the kit, the dates, the vibe. Who's a good fit."
          value={data.description}
          onChange={(v) => update('description', v.slice(0, 400))}
          maxLength={400}
          rows={5}
        />
      </div>
    </FieldGroup>

    {/* Budget */}
    <FieldGroup label="05 · Budget" hint="Be specific — '₹45–60k' beats 'negotiable'.">
      <TextInput
        label="Budget"
        placeholder={
          data.workType === 'paid' ? 'e.g. ₹45–60k / day, or ₹2L for the project' :
          data.workType === 'collab' ? 'e.g. Credit + meals, or 5% profit share' :
          data.workType === 'mentorship' ? 'e.g. Mentorship — no pay, real credit' :
          'e.g. ₹50k/month stipend + housing'
        }
        value={data.budget}
        onChange={(v) => update('budget', v.slice(0, 60))}
        maxLength={60}
      />
    </FieldGroup>

    {/* Contact */}
    <FieldGroup label="06 · How to apply" hint="Where alumni reach you when they're interested.">
      <div className="grid grid-cols-2 gap-2">
        <Choice
          active={data.contact === 'message'}
          onClick={() => update('contact', 'message')}
          title="Forge message"
          helper="Inbox on this platform"
        />
        <Choice
          active={data.contact === 'email'}
          onClick={() => update('contact', 'email')}
          title="Email"
          helper={(profile?.full_name?.split(' ')[0] || 'you').toLowerCase() + '@theforge.in'}
        />
      </div>
    </FieldGroup>
  </div>
);

// ---------- Live preview (mirrors GigRow in the directory) ----------
const LivePreview: React.FC<{ data: FormData; profile: any }> = ({ data, profile }) => (
  <div className="p-6 space-y-5">
    <div className="flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Live preview</div>
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(41_100%_62%)]" />
        Updating
      </div>
    </div>

    {/* Card-styled preview */}
    <article className="rounded-2xl border border-border/40 bg-background/40 p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 border border-primary/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> Open
        </span>
        <span className="text-[11px] text-muted-foreground">Just now</span>
        {data.mode === 'remote' && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">· Remote</span>
        )}
        {data.mode === 'hybrid' && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">· Hybrid</span>
        )}
      </div>

      <h3 className={cn(
        'mt-2.5 text-xl leading-tight',
        data.title ? 'text-foreground' : 'text-muted-foreground/50 italic'
      )}>
        {data.title || 'Your gig title will appear here'}
      </h3>

      <p className={cn(
        'mt-1.5 text-sm leading-relaxed line-clamp-3',
        data.description ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'
      )}>
        {data.description || 'A short description of the role, dates, kit, and who\'s a good fit.'}
      </p>

      {/* Poster badge */}
      <div className="mt-3 inline-flex items-center gap-2">
        <Avatar className="h-6 w-6 ring-1 ring-border/50">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/15 text-primary text-[10px]">
            {(profile?.full_name || 'Y').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Posted by</span>
          <span className="font-medium text-foreground">{profile?.full_name || 'You'}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Star className="h-2.5 w-2.5 text-primary" /> Alumni
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-border/30 pt-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Budget</div>
          <div className={cn(
            'mt-0.5 text-xl tabular-nums',
            data.budget ? 'text-foreground' : 'text-muted-foreground/50 italic'
          )}>
            {data.budget || 'Add a budget'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Location</div>
          <div className={cn(
            'mt-0.5 text-sm inline-flex items-center gap-1',
            (data.mode === 'remote' || data.location) ? 'text-foreground' : 'text-muted-foreground/50 italic'
          )}>
            <MapPin className="h-3 w-3" />
            {data.mode === 'remote' ? 'Remote' : (data.location || 'Add a city')}
          </div>
        </div>
      </div>
    </article>

    {/* Verification note */}
    <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Clock className="h-3 w-3 text-primary" /> What happens next
      </div>
      <ol className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
        <Step n={1}>You publish — gig enters review.</Step>
        <Step n={2}>Forge team verifies within 24h.</Step>
        <Step n={3}>Goes live to all alumni. You get notified for every applicant.</Step>
      </ol>
    </div>
  </div>
);

const Step: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <li className="flex items-start gap-2.5">
    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/40 text-[9px] text-primary tabular-nums">{n}</span>
    <span>{children}</span>
  </li>
);

// ---------- Success state ----------
const PublishedSuccess: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
      <Check className="h-7 w-7" />
    </div>
    <h2 className="mt-5 text-[32px] leading-[1.02] tracking-tight text-foreground">
      Gig is <span className="italic text-primary">in review</span>.
    </h2>
    <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
      We&apos;ll verify <span className="text-foreground">&ldquo;{data.title}&rdquo;</span> within 24 hours. You&apos;ll get an email the moment it goes live.
    </p>
    <p className="mt-6 text-xs text-muted-foreground/70">Heading back to the Circle…</p>
  </div>
);

// ---------- Reusable bits ----------
const FieldGroup: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <section>
    <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{label}</div>
    {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

const Choice: React.FC<{ active: boolean; onClick: () => void; title: string; helper?: string }> = ({ active, onClick, title, helper }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group rounded-2xl border p-3 text-left transition-all',
      active
        ? 'border-primary/60 bg-primary/10 text-foreground shadow-[0_4px_16px_-6px_hsl(41_100%_62%/0.4)]'
        : 'border-border/40 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
    )}
  >
    <div className={cn('text-sm font-medium', active && 'text-primary')}>{title}</div>
    {helper && <div className="mt-0.5 text-[11px] text-muted-foreground/80">{helper}</div>}
  </button>
);

const TextInput: React.FC<{
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  icon?: React.ReactNode;
}> = ({ label, placeholder, value, onChange, maxLength, icon }) => (
  <div>
    {(label || maxLength) && (
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1.5">
            {icon} {label}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] tabular-nums text-muted-foreground/60">
            {value.length}<span className="text-muted-foreground/40">/{maxLength}</span>
          </span>
        )}
      </div>
    )}
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="mt-2 w-full rounded-2xl border border-border/40 bg-card/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors"
    />
  </div>
);

const TextareaInput: React.FC<{
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  rows?: number;
}> = ({ label, placeholder, value, onChange, maxLength, rows = 4 }) => (
  <div>
    {(label || maxLength) && (
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
        )}
        {maxLength && (
          <span className="text-[11px] tabular-nums text-muted-foreground/60">
            {value.length}<span className="text-muted-foreground/40">/{maxLength}</span>
          </span>
        )}
      </div>
    )}
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="mt-2 w-full resize-none rounded-2xl border border-border/40 bg-card/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors"
    />
  </div>
);

// Custom dark dropdown
const Dropdown: React.FC<{
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}> = ({ value, placeholder, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const current = options.find(o => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl border bg-card/40 px-4 py-3 text-base transition-all',
          current ? 'border-primary/60 text-foreground' : 'border-border/40 text-muted-foreground/60',
          open && 'ring-2 ring-primary/30'
        )}
      >
        <span>{current ? current.label : placeholder}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[280px] overflow-y-auto rounded-2xl border border-border/50 bg-card shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]"
        >
          <ul className="py-1">
            {options.map(o => {
              const selected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                      selected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-card hover:text-primary'
                    )}
                  >
                    <span>{o.label}</span>
                    {selected && <CheckIcon />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
    <path d="M2.5 6.5l2 2 5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CommunityPostGig;
