import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  Users,
  Star,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ---------- Types ----------
type Creative = {
  id: string;
  collabId: string;
  name: string;
  tagline: string;
  city: string;
  occupations: string[];
  avatar?: string;
  available: boolean;
  cohort: string;
  about: string;
  portfolioUrl: string;
  email: string;
  instagram: string;
  editionId: string;
};

const OCCUPATIONS = ['All', 'Director', 'Writer', 'Editor', 'Creator', 'Podcaster', 'DOP', 'Producer', 'Sound', 'Designer', 'AD', 'Colorist', 'Motion', 'VFX', 'Casting'];

type WorkType = 'paid' | 'collab' | 'mentorship' | 'residency';
type Mode = 'remote' | 'hybrid' | 'onsite';

type Poster =
  | { kind: 'alumni'; name: string; cohort: string; avatar: string }
  | { kind: 'levelup'; name: 'LevelUp Learning' };

const levelup: Poster = { kind: 'levelup', name: 'LevelUp Learning' };

type Gig = {
  id: string;
  title: string;
  postedBy: Poster;
  budget: string;
  location: string;
  role: string;
  workType: WorkType;
  mode: Mode;
  postedAt: string;
  description: string;
  status: 'open' | 'closing' | 'closed';
};

// ---------- Recent joiners hook ----------
function useRecentJoiners() {
  return useQuery({
    queryKey: ['recent-joiners'],
    queryFn: async () => {
      // Simple query — no FK join needed
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, specialty')
        .or('is_admin.is.null,is_admin.eq.false')
        .not('full_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name,
        role: p.specialty || 'Creator',
        city: p.city || '',
        avatar: p.avatar_url,
      }));
    },
  });
}

// ---------- Hooks ----------
function useCreatives() {
  return useQuery({
    queryKey: ['community-creatives'],
    queryFn: async () => {
      // Two separate queries — avoids FK relationship requirement in PostgREST.
      // profiles has no FK to collaborator_profiles so nested select fails.
      const [profilesRes, collabRes, editionsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city, email, instagram_handle, edition_id, tagline, specialty, bio')
          .or('is_admin.is.null,is_admin.eq.false')
          .not('full_name', 'is', null),
        supabase
          .from('collaborator_profiles')
          .select('user_id, id, tagline, occupations, available_for_hire, about, intro, portfolio_url, is_published'),
        supabase
          .from('editions')
          .select('id, name'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      // Build lookup maps
      const collabByUser = new Map<string, any>();
      (collabRes.data || []).forEach((cp: any) => collabByUser.set(cp.user_id, cp));

      const editionById = new Map<string, string>();
      (editionsRes.data || []).forEach((e: any) => editionById.set(e.id, e.name));

      return (profilesRes.data || []).map((p: any) => {
        const cp = collabByUser.get(p.id);
        return {
          id: p.id,
          collabId: cp?.id || '',
          name: p.full_name || 'Unknown',
          tagline: cp?.tagline || p.tagline || p.specialty || '',
          city: p.city || '',
          occupations: cp?.occupations || (p.specialty ? [p.specialty] : []),
          avatar: p.avatar_url || undefined,
          available: cp?.available_for_hire ?? false,
          cohort: editionById.get(p.edition_id) || '',
          about: cp?.about || cp?.intro || p.bio || '',
          portfolioUrl: cp?.portfolio_url || '',
          email: p.email || '',
          instagram: p.instagram_handle || '',
          editionId: p.edition_id || '',
        };
      });
    },
  });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function useGigs() {
  return useQuery({
    queryKey: ['community-gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          id, title, description, budget, location, roles_needed,
          gig_type, pay_type, status, created_at, user_id,
          profiles(full_name, avatar_url, edition_id, editions(name))
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description || '',
        budget: g.budget || 'TBD',
        location: g.location || 'Remote',
        role: g.roles_needed?.[0] || '',
        workType: (g.gig_type as any) || 'paid',
        mode: (g.pay_type as any) || 'remote',
        postedAt: formatRelative(g.created_at),
        status: (g.status as any) || 'open',
        postedBy: g.profiles?.full_name
          ? { kind: 'alumni' as const, name: g.profiles.full_name, cohort: g.profiles?.editions?.name || '', avatar: g.profiles?.avatar_url || '' }
          : { kind: 'levelup' as const, name: 'LevelUp Learning' as const },
      }));
    },
  });
}

// ---------- Helpers ----------
function initialsOf(name?: string | null) {
  if (!name?.trim()) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ---------- Page ----------
const CommunityRedesign: React.FC = () => {
  const [tab, setTab] = useState<'creatives' | 'gigs'>('creatives');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[700px] w-[1300px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(41_100%_62%/0.18),transparent_70%)] blur-3xl" />
        <div className="absolute top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(closest-side,hsl(27_85%_48%/0.10),transparent_70%)] blur-3xl" />
        <div className="absolute top-[40vh] -right-40 h-[400px] w-[400px] rounded-full bg-[radial-gradient(closest-side,hsl(39_90%_44%/0.08),transparent_70%)] blur-3xl" />
      </div>

      <TopBar tab={tab} setTab={setTab} />

      <main className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-12 pb-24 md:pb-12">
        {tab === 'creatives' && <CreativesView />}
        {tab === 'gigs' && <GigsView />}
      </main>
    </div>
  );
};

// ---------- Top bar (tabs only — no logo, app layout provides that) ----------
const TopBar: React.FC<{ tab: 'creatives' | 'gigs'; setTab: (t: 'creatives' | 'gigs') => void }> = ({ tab, setTab }) => {
  const items: Array<{ key: 'creatives' | 'gigs'; label: string; icon: React.ReactNode }> = [
    { key: 'creatives', label: 'Creatives', icon: <Users className="h-4 w-4" /> },
    { key: 'gigs', label: 'Gigs', icon: <Briefcase className="h-4 w-4" /> },
  ];
  return (
    <>
    {/* Desktop tab bar */}
    <div className="sticky top-0 z-30 hidden border-b border-border/40 bg-background/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-8 px-8 lg:px-12">
        <nav>
          <ul className="flex gap-1">
            {items.map(it => {
              const active = tab === it.key;
              return (
                <li key={it.key}>
                  <button
                    onClick={() => setTab(it.key)}
                    className={cn(
                      'group relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className={cn(active ? 'text-primary' : 'text-muted-foreground/70')}>{it.icon}</span>
                    <span className="text-lg tracking-tight">{it.label}</span>
                    <span className={cn(
                      'absolute -bottom-[1px] left-0 right-0 h-[2px] origin-center transition-transform duration-300',
                      active ? 'scale-x-100 bg-primary shadow-[0_0_10px_hsl(41_100%_62%/0.7)]' : 'scale-x-0 bg-primary/40 group-hover:scale-x-50'
                    )} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link
          to="/community/onboarding"
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Set up profile
        </Link>
      </div>
    </div>

    {/* Mobile inline tab switcher — shown instead of bottom nav */}
    <div className="flex gap-2 px-4 pt-3 md:hidden">
      {items.map(it => (
        <button key={it.key} onClick={() => setTab(it.key)}
          className={cn('flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            tab === it.key ? 'bg-primary text-black' : 'bg-card/60 text-muted-foreground border border-border/40'
          )}>
          {it.icon}{it.label}
        </button>
      ))}
    </div>
    </>
  );
};

// ---------- Creatives ----------
const INITIAL_VISIBLE = 12;

const CreativesView: React.FC = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [scope, setScope] = useState<'all' | 'cohort'>('all');
  const [selected, setSelected] = useState<Creative | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { data: creatives = [], isLoading: creativesLoading } = useCreatives();

  const filtered = useMemo(() => {
    let r = creatives;
    if (role !== 'All') r = r.filter(c => c.occupations.includes(role));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    if (scope === 'cohort') r = r.filter(c => c.editionId === profile?.edition_id);
    // Profiles with a photo first, then alphabetical within each group
    return [...r].sort((a, b) => {
      const aHasPhoto = !!a.avatar;
      const bHasPhoto = !!b.avatar;
      if (aHasPhoto && !bHasPhoto) return -1;
      if (!aHasPhoto && bHasPhoto) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [creatives, role, search, scope, profile]);

  return (
    <div>
      {/* Hero band: editorial title + spotlight side by side */}
      <section className="pt-6 pb-8 md:pt-10 md:pb-12">
        <h1 className="text-[32px] sm:text-[44px] lg:text-[56px] xl:text-[72px] leading-[0.92] tracking-tight text-foreground">
          <span className="block">The</span>
          <span className="flex items-center gap-2">
            <span className="italic text-primary">Community</span>
            <span>.</span>
          </span>
        </h1>
        <p className="mt-4 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
          Forge alumni meet here. Hire each other, post gigs, swap drafts, ship work that wouldn&apos;t exist otherwise.
        </p>
      </section>

      {/* Main directory — full width, filters inline */}
      <section className="mt-4">
        {/* Header row: title left · search + scope + sort right */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl text-foreground">
              {scope === 'cohort' ? 'Your cohort' : 'All creatives'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {role === 'All' ? 'Every craft.' : `Showing ${role}s.`} {search && <>Matching "{search}".</>}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Name, craft, city…"
                className="w-full rounded-full border border-border/40 bg-card/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none transition-colors"
              />
            </div>

            {/* Scope segmented */}
            <div className="inline-flex rounded-full border border-border/40 bg-card/40 p-1">
              <button
                onClick={() => setScope('all')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                  scope === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                onClick={() => setScope('cohort')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors',
                  scope === 'cohort' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Star className="h-3 w-3" /> Your cohort
              </button>
            </div>

          </div>
        </div>

        {/* Responsive grid: 2-col on phone → 4-col on xl */}
        {creativesLoading ? (
          <div className="text-muted-foreground text-sm p-8 text-center">Loading...</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {!creativesLoading && filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <p className="text-2xl font-semibold text-foreground mb-2">No creatives found</p>
                <p className="text-muted-foreground text-sm">Try a different search or filter</p>
              </div>
            )}
            {filtered.slice(0, visibleCount).map((c, idx) => (
              <CreativeTile key={c.id} c={c} large={false} accentIndex={idx} onOpen={setSelected} />
            ))}
          </div>
        )}

        {filtered.length > visibleCount && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(v => v + INITIAL_VISIBLE)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/60 pb-1"
            >
              Show more creatives
            </button>
          </div>
        )}
      </section>

      <CreativeSheet c={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

// ---------- Bottom sheet ----------
const CreativeSheet: React.FC<{ c: Creative | null; onClose: () => void }> = ({ c, onClose }) => {
  if (!c) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t border-border/40 bg-card shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.5)]">
        {/* Grab handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-card/95 backdrop-blur pt-3 pb-2">
          <span className="h-1 w-12 rounded-full bg-border" />
        </div>

        {/* Header with portrait */}
        <div className="relative h-44 overflow-hidden">
          {c.avatar ? (
            <img src={c.avatar} alt={c.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/10 to-card text-6xl text-primary">
              {initialsOf(c.name)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          {c.available && (
            <span className="absolute left-5 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(41_100%_62%)]" />
              For hire
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 -mt-12 relative">
          <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{c.cohort}</div>
          <h3 className="mt-1 text-3xl font-semibold leading-tight text-foreground">{c.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {c.city}
          </div>

          <p className="mt-5 text-base leading-relaxed text-foreground/90 border-l-2 border-primary/70 pl-3 italic">
            {c.tagline}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {c.occupations.map(o => (
              <span key={o} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {o}
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border/40 bg-background/40 p-4">
            <div>
              <div className={cn('text-2xl leading-none', c.available ? 'text-primary' : 'text-muted-foreground')}>
                {c.available ? 'Open' : 'Busy'}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              to={`/community/creative/${c.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={onClose}
            >
              View profile <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/40 px-5 py-3 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BigStat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div>
    <div className="text-4xl xl:text-5xl leading-none text-foreground">{value}</div>
    <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
  </div>
);

const AdBanner: React.FC = () => (
  <article className="relative h-full min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-3xl border border-border/40 bg-black">
    {/* Illustration centered, full-bleed but not cropped */}
    <img
      src="/images/community-hero.png"
      alt="Forge alumni helping each other climb"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />

    {/* Eyebrow chip — top-left */}
    <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(41_100%_62%)]" />
      The Forge · Community
    </span>
  </article>
);

const SpotlightCard: React.FC<{ creative: Creative }> = ({ creative }) => (
  <article className="relative h-full overflow-hidden rounded-2xl border border-border/40 bg-card/70 backdrop-blur min-h-[460px]">
    <div className="absolute inset-0 bg-[radial-gradient(at_top_right,hsl(41_100%_62%/0.18),transparent_55%)]" />
    <div className="relative grid h-full grid-cols-5">
      {/* Left: visual area with avatar */}
      <div className="col-span-2 relative flex flex-col justify-between bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/50 bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(41_100%_62%)] animate-pulse" />
          Spotlight
        </div>
        <div className="flex items-center justify-center flex-1 my-4">
          <Avatar className="h-40 w-40 ring-4 ring-background/60 shadow-2xl">
            <AvatarImage src={creative.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-5xl">{initialsOf(creative.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      {/* Right: text + meta */}
      <div className="col-span-3 p-8 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{creative.cohort} · {creative.city}</div>
          {creative.available && (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(41_100%_62%)]" /> Available
            </span>
          )}
        </div>
        <h3 className="mt-3 text-5xl leading-tight text-foreground">{creative.name}</h3>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">{creative.tagline}</p>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {creative.occupations.map(o => (
            <span key={o} className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] border border-border/50 text-muted-foreground">
              {o}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-8 flex items-center justify-between">
          <button className="group inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
            View profile
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  </article>
);

const FeaturedCard: React.FC<{ c: Creative }> = ({ c }) => (
  <article className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card hover:-translate-y-0.5">
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 ring-2 ring-border/50 transition-all group-hover:ring-primary/40">
        <AvatarImage src={c.avatar} />
        <AvatarFallback className="bg-primary/15 text-primary">{initialsOf(c.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg leading-tight text-foreground truncate">{c.name}</h3>
        <div className="text-[11px] text-muted-foreground">{c.occupations[0]} · {c.city}</div>
      </div>
      {c.available && <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(41_100%_62%)] animate-pulse" />}
    </div>
    <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{c.tagline}</p>
  </article>
);

const FilterPanel: React.FC<{
  scope: 'all' | 'cohort';
  setScope: (s: 'all' | 'cohort') => void;
  role: string;
  setRole: (r: string) => void;
  search: string;
  setSearch: (s: string) => void;
}> = ({ scope, setScope, role, setRole, search, setSearch }) => (
  <div className="space-y-5">
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Search</div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Name, craft, city…"
          className="w-full border-b border-border/40 bg-transparent pb-2 pl-6 pr-2 pt-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
        />
      </div>
    </div>

    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Scope</div>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setScope('all')}
          className={cn(
            'flex items-center py-1.5 text-sm transition-colors',
            scope === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="inline-flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', scope === 'all' ? 'bg-primary' : 'bg-border')} />
            All creatives
          </span>
        </button>
        <button
          onClick={() => setScope('cohort')}
          className={cn(
            'flex items-center py-1.5 text-sm transition-colors',
            scope === 'cohort' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="inline-flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', scope === 'cohort' ? 'bg-primary' : 'bg-border')} />
            <Star className="h-3 w-3 text-primary" /> Your cohort
          </span>
        </button>
      </div>
    </div>

    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Craft</div>
      <div className="flex flex-wrap gap-1.5">
        {OCCUPATIONS.map(o => {
          const active = role === o;
          return (
            <button
              key={o}
              onClick={() => setRole(o)}
              className={cn(
                'px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-all border',
                active
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const PostGigCTA: React.FC = () => (
  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
    <h3 className="text-lg font-semibold text-foreground mb-1">Got work to share?</h3>
    <p className="text-sm text-muted-foreground mb-4">Post a gig in 60 seconds. Every listing is verified by the Forge team.</p>
    <Link to="/community/post-gig" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors">
      Post a gig <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

const RecentJoinersPanel: React.FC = () => {
  const { data: joiners = [] } = useRecentJoiners();
  return (
    <div className="border-t border-border/40 pt-6">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
        <Clock className="h-3 w-3 text-primary" /> Just joined
      </div>
      <ul className="space-y-3">
        {joiners.map(j => (
          <li key={j.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-1 ring-border/50">
              <AvatarImage src={j.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initialsOf(j.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-foreground truncate">{j.name}</div>
              <div className="text-[11px] text-muted-foreground">{j.role} · {j.city}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CreativeTile: React.FC<{ c: Creative; large?: boolean; accentIndex?: number; onOpen?: (c: Creative) => void }> = ({ c, onOpen }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    // Desktop (hover-capable pointer) → go straight to profile.
    // Mobile (no hover) → open the bottom sheet preview.
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
    if (isDesktop) {
      navigate(`/community/creative/${c.id}`);
    } else {
      onOpen?.(c);
    }
  };
  return (
  <button type="button" onClick={handleClick} className="block w-full text-left">
  <article className="group relative aspect-[3/4] sm:aspect-[4/5] [perspective:1200px]">
    <div className="relative h-full w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] md:group-hover:[transform:rotateX(180deg)]">
      {/* FRONT — full-bleed portrait */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border/40 bg-card [backface-visibility:hidden]">
        {c.avatar ? (
          <img
            src={c.avatar}
            alt={c.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/10 to-card text-6xl text-primary">
            {initialsOf(c.name)}
          </div>
        )}

        {/* Bottom gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

        {/* Available badge */}
        {c.available && (
          <span className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-primary/40 bg-black/40 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-primary backdrop-blur">
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(41_100%_62%)]" />
            For hire
          </span>
        )}

        {/* Subtle flip hint */}
        <span className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur transition-opacity md:group-hover:opacity-0">
          <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </span>

        {/* Bottom-left meta */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
          <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.14em] text-primary/90 truncate font-medium">
            {c.occupations[0] || ''}
          </div>
          <h3 className="mt-0.5 text-sm sm:text-xl leading-[1.1] text-white truncate font-semibold">{c.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-white/70">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
            <span className="truncate">{c.city || c.cohort}</span>
          </div>
        </div>
      </div>

      {/* BACK — info + CTA */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-primary/40 bg-card [backface-visibility:hidden] [transform:rotateX(180deg)]">
        {/* Ambient amber wash */}
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,hsl(41_100%_62%/0.18),transparent_60%)]" />
        {/* Faint portrait echo */}
        {c.avatar && (
          <img
            src={c.avatar}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-luminosity"
          />
        )}

        <div className="relative flex h-full flex-col p-3 sm:p-5">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-primary/80">{c.cohort}</div>
          <h3 className="mt-1 text-base sm:text-xl leading-tight text-foreground truncate">{c.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {c.city}
          </div>

          <p className="mt-5 italic text-lg leading-snug text-foreground/90 border-l-2 border-primary/70 pl-3">
            {c.tagline}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {c.occupations.map(o => (
              <span key={o} className="px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] border border-border/60 text-muted-foreground">
                {o}
              </span>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/40 pt-5">
            <div>
              <div className={cn('text-2xl leading-none', c.available ? 'text-primary' : 'text-muted-foreground')}>
                {c.available ? 'Open' : 'Busy'}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</div>
            </div>
          </div>

          <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
            View profile
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  </article>
  </button>
  );
};

// ---------- Gigs ----------
const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'any', label: 'open to anything' },
  { value: 'Director', label: 'a Director' },
  { value: 'DOP', label: 'a DOP' },
  { value: 'Editor', label: 'an Editor' },
  { value: 'Writer', label: 'a Writer' },
  { value: 'Producer', label: 'a Producer' },
  { value: 'Sound', label: 'a Sound designer' },
  { value: 'Composer', label: 'a Composer' },
  { value: 'Designer', label: 'a Designer' },
  { value: 'Production Designer', label: 'a Production designer' },
  { value: 'Creator', label: 'a Creator' },
  { value: 'Podcaster', label: 'a Podcaster' },
];

const WORK_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'any', label: 'any work' },
  { value: 'paid', label: 'paid work' },
  { value: 'collab', label: 'a collaboration' },
  { value: 'mentorship', label: 'mentorship' },
  { value: 'residency', label: 'a residency' },
];

const LOC_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'anywhere', label: 'anywhere' },
  { value: 'remote', label: 'remote only' },
  { value: 'hybrid', label: 'hybrid' },
  { value: 'Mumbai', label: 'in Mumbai' },
  { value: 'Bengaluru', label: 'in Bengaluru' },
  { value: 'Delhi', label: 'in Delhi' },
  { value: 'Chennai', label: 'in Chennai' },
  { value: 'Kerala', label: 'in Kerala' },
];

const GigsView: React.FC = () => {
  const [role, setRole] = useState('any');
  const [work, setWork] = useState('any');
  const [loc, setLoc] = useState('anywhere');

  const { data: gigs = [], isLoading: gigsLoading } = useGigs();

  const filtered = useMemo(() => {
    return gigs.filter(g => {
      if (role !== 'any' && g.role !== role) return false;
      if (work !== 'any' && g.workType !== work) return false;
      if (loc === 'remote' && g.mode !== 'remote') return false;
      if (loc === 'hybrid' && g.mode !== 'hybrid') return false;
      if (!['anywhere', 'remote', 'hybrid'].includes(loc)) {
        if (!g.location.toLowerCase().includes(loc.toLowerCase())) return false;
      }
      return true;
    });
  }, [gigs, role, work, loc]);

  const reset = () => { setRole('any'); setWork('any'); setLoc('anywhere'); };
  const isDefault = role === 'any' && work === 'any' && loc === 'anywhere';

  return (
    <div>
      {/* Hero band */}
      <section className="pt-6 pb-8 md:pt-10 md:pb-10 flex flex-col lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h1 className="text-[32px] sm:text-[44px] lg:text-[56px] xl:text-[72px] leading-[0.95] tracking-tight text-foreground">
            Open <span className="italic text-primary">gigs</span>.
          </h1>
          <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Paid work, collaborations, and residencies — alumni to alumni. Forge keeps the matching, not the fees.
          </p>
        </div>

        {/* Post-a-gig CTA card */}
        <div className="lg:col-span-5 mt-6 lg:mt-0">
          <GigStack />
        </div>
      </section>

      {/* Mad-Libs filter sentence */}
      <section className="rounded-3xl border border-border/40 bg-card/40 p-7 sm:p-10 lg:p-12 my-6">
        <div className="flex items-center justify-between">
          {!isDefault && (
            <button onClick={reset} className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors">
              Reset
            </button>
          )}
        </div>

        <p className="mt-5 text-[28px] sm:text-[36px] xl:text-[44px] leading-[1.25] tracking-tight text-muted-foreground">
          I am <InlineSelect value={role} options={ROLE_OPTIONS} onChange={setRole} />{' '}
          looking for <InlineSelect value={work} options={WORK_OPTIONS} onChange={setWork} />,{' '}
          <InlineSelect value={loc} options={LOC_OPTIONS} onChange={setLoc} />.
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-5">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground tabular-nums text-base">{filtered.length}</span>
            {' '}gig{filtered.length === 1 ? '' : 's'} match your search
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Tap any underlined word to change
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground/70">
          Only Forge alumni and LevelUp Learning can post here — every gig is verified before it goes live.
        </p>
      </section>

      {/* Filtered list */}
      <section className="border-y border-border/40">
        {gigsLoading ? (
          <div className="text-muted-foreground text-sm p-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-foreground">No gigs match this search yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try loosening one of the filters above — or {' '}
              <button onClick={reset} className="underline underline-offset-2 text-primary">reset</button>.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {filtered.map(g => <GigRow key={g.id} g={g} />)}
          </ul>
        )}
      </section>
    </div>
  );
};

// Static post-a-gig CTA card — replaces the fake rotating carousel
const GigStack: React.FC = () => (
  <div className="w-full h-[300px] sm:h-[340px]">
    <article className="h-full overflow-hidden rounded-3xl border border-primary/30 bg-card p-7 flex flex-col justify-between"
      style={{ background: 'linear-gradient(135deg, hsl(0 0% 7%) 0%, hsl(0 0% 5%) 100%)' }}>
      <div className="flex items-start justify-between">
        <span className="text-3xl">✍️</span>
      </div>
      <div>
        <h3 className="text-2xl sm:text-[28px] leading-tight tracking-tight text-foreground">
          Got work to share?
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Forge alumni post in 60 seconds. Every gig is verified by the team before going live.
        </p>
      </div>
      <Link
        to="/community/post-gig"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.5)] transition-colors"
      >
        Post a gig <ArrowUpRight className="h-4 w-4" />
      </Link>
    </article>
  </div>
);

// StackCardContent removed — GigStack is now a static card, no carousel needed

// Inline pill-style select with a custom dark-themed popover
const InlineSelect: React.FC<{
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const current = options.find(o => o.value === value) ?? options[0];
  const isDefault = value === options[0]?.value;

  // Close on click outside / escape
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
    <span ref={wrapperRef} className="relative inline-flex items-center align-baseline">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 sm:px-4 py-0.5 sm:py-1 transition-all text-[0.7em] leading-none',
          isDefault
            ? 'border-border/60 bg-card text-foreground hover:border-primary/40'
            : 'border-primary/60 bg-primary/10 text-primary',
          open && 'ring-2 ring-primary/30'
        )}
      >
        {current.label}
        <ChevronDown className={cn('h-[0.5em] w-[0.5em] opacity-70 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-max min-w-[200px] max-w-[280px] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur"
          style={{ fontSize: '14px' }}
        >
          <ul className="max-h-[280px] overflow-y-auto py-1">
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
                      'group flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors',
                      selected
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-card hover:text-primary'
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {selected ? (
                      <CheckIcon />
                    ) : (
                      <span className="h-3 w-3" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </span>
  );
};

const GigRow: React.FC<{ g: Gig }> = ({ g }) => {
  const statusStyles =
    g.status === 'open' ? 'text-primary border-primary/40' :
    g.status === 'closing' ? 'text-orange-400 border-orange-500/40' :
    'text-muted-foreground border-border/40';

  return (
    <li className="group py-4 sm:py-6 transition-colors hover:bg-card/30 -mx-2 px-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em]', statusStyles)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {g.status}
            </span>
            <span className="text-[11px] text-muted-foreground">{g.postedAt} ago</span>
            {(g.mode === 'remote' || g.mode === 'hybrid') && (
              <span className="text-[10px] text-muted-foreground capitalize">· {g.mode}</span>
            )}
          </div>
          <h3 className="mt-2 text-base sm:text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{g.title}</h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">{g.description}</p>
          <PosterBadge poster={g.postedBy} />
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm sm:text-lg font-semibold text-foreground tabular-nums">{g.budget}</div>
          <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
            <MapPin className="h-2.5 w-2.5" /> {g.location}
          </div>
          <button className="mt-2 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary">
            Apply <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
};

// Renders the "Posted by" badge — distinct treatments for alumni vs LevelUp
const PosterBadge: React.FC<{ poster: Poster }> = ({ poster }) => {
  if (poster.kind === 'levelup') {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 pl-1 pr-3 py-1">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
          LU
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="font-medium text-foreground">{poster.name}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-primary">
            <CheckIcon /> Verified
          </span>
        </span>
      </div>
    );
  }
  return (
    <div className="mt-3 inline-flex items-center gap-2">
      <Avatar className="h-6 w-6 ring-1 ring-border/50">
        <AvatarImage src={poster.avatar} alt={poster.name} />
        <AvatarFallback className="bg-primary/15 text-primary text-[10px]">{initialsOf(poster.name)}</AvatarFallback>
      </Avatar>
      <div className="inline-flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">Posted by</span>
        <span className="font-medium text-foreground">{poster.name}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Star className="h-2.5 w-2.5 text-primary" /> Alumni · {poster.cohort}
        </span>
      </div>
    </div>
  );
};

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
    <path d="M2.5 6.5l2 2 5-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- Chat ----------
const ChatView: React.FC = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get the cohort group for this user's edition
  const { data: cohortGroup } = useQuery({
    queryKey: ['cohort-group', profile?.edition_id],
    enabled: !!profile?.edition_id,
    queryFn: async () => {
      const { data } = await supabase
        .from('cohort_groups')
        .select('id, name')
        .eq('edition_id', profile!.edition_id!)
        .single();
      return data;
    },
  });

  // Get messages for this cohort group
  const { data: messages = [] } = useQuery({
    queryKey: ['community-messages', cohortGroup?.id],
    enabled: !!cohortGroup?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('community_messages')
        .select(`id, content, created_at, user_id, is_announcement, profiles(full_name, avatar_url)`)
        .eq('group_id', cohortGroup!.id)
        .order('created_at', { ascending: true })
        .limit(100);
      return data || [];
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!cohortGroup?.id) return;
    const channel = supabase
      .channel(`chat-${cohortGroup.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `group_id=eq.${cohortGroup.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['community-messages', cohortGroup.id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [cohortGroup?.id, queryClient]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !cohortGroup?.id || !user?.id) return;
    await supabase.from('community_messages').insert({
      content: message.trim(),
      group_id: cohortGroup.id,
      user_id: user.id,
      cohort_group_id: cohortGroup.id,
    });
    setMessage('');
  };

  const groupName = cohortGroup?.name || 'Your Cohort';

  return (
    <div className="pt-12">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-primary/80">Group chat</div>
        <h1 className="mt-3 text-[56px] leading-[0.95] tracking-tight text-foreground">
          The <span className="italic text-primary">talk</span>.
        </h1>
      </div>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[520px]">
        <aside className="col-span-12 md:col-span-3 rounded-xl border border-border/40 bg-card/60 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Cohort</div>
          <ul className="mt-3 mb-5 space-y-1">
            <li>
              <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm bg-primary/10 text-primary">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(41_100%_62%)]" />
                  {groupName}
                </span>
                <span className="text-[10px] tabular-nums">{messages.length}</span>
              </button>
            </li>
          </ul>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Cities</div>
          <ul className="mt-3 space-y-1">
            {[['Mumbai',28],['Bengaluru',19],['Delhi',12],['Chennai',8],['Pune',6]].map(([g,n]) => (
              <li key={g as string}>
                <button className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    {g}
                  </span>
                  <span className="text-[10px] tabular-nums">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-12 md:col-span-6 rounded-xl border border-border/40 bg-card/40 flex flex-col">
          <header className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Group</div>
              <h3 className="text-xl text-foreground">{groupName}</h3>
            </div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(41_100%_62%)]" />
              {messages.length} messages
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No messages yet. Be the first to say hi!
              </div>
            ) : (
              (messages as any[]).map((msg: any) => {
                const isOwn = msg.user_id === user?.id;
                return (
                  <div key={msg.id} className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/15 text-primary text-xs">
                        {initialsOf(msg.profiles?.full_name || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('max-w-[75%]', isOwn && 'items-end flex flex-col')}>
                      <div className={cn('text-[10px] uppercase tracking-[0.14em] mb-1', isOwn ? 'text-right text-primary/70' : 'text-muted-foreground')}>
                        {isOwn ? 'You' : (msg.profiles?.full_name || 'Unknown')}
                      </div>
                      <div className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border border-border/40 text-foreground rounded-tl-sm'
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-border/40 p-3 flex items-center gap-3">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message ${groupName}…`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:bg-primary/90"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="col-span-12 md:col-span-3 rounded-xl border border-border/40 bg-card/60 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Recent</div>
          <ul className="mt-3 space-y-3">
            {(messages as any[]).slice(-6).reverse().map((msg: any) => (
              <li key={msg.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/15 text-primary text-xs">{initialsOf(msg.profiles?.full_name || '?')}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card shadow-[0_0_6px_hsl(41_100%_62%)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-foreground truncate">{msg.profiles?.full_name || 'Unknown'}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{msg.content}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default CommunityRedesign;
