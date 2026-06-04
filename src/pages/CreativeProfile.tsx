import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Plus,
  Share2,
  Briefcase,
  Play,
  ArrowUpRight,
  Globe,
  Instagram,
  Star,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Standardised covers, keyed by craft group. Every occupation maps to one of these,
// so all directors share a cover, all editors share one, etc.
const COVER_GROUPS = {
  visual:     { img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=2000', label: 'On set' },
  post:       { img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=2000', label: 'Post' },
  audio:      { img: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=2000', label: 'Studio' },
  words:      { img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=2000', label: 'Writers room' },
  production: { img: 'https://images.unsplash.com/photo-1542204625-ca960aabb8e7?w=2000', label: 'Production' },
  design:     { img: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=2000', label: 'Studio' },
  vfx:        { img: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=2000', label: 'VFX bay' },
} as const;

type CoverKey = keyof typeof COVER_GROUPS;

const OCCUPATION_TO_GROUP: Record<string, CoverKey> = {
  Director: 'visual',
  DOP: 'visual',
  Photographer: 'visual',
  'Production Designer': 'visual',
  Editor: 'post',
  Colorist: 'post',
  VFX: 'vfx',
  Sound: 'audio',
  Composer: 'audio',
  Writer: 'words',
  Producer: 'production',
  AD: 'production',
  Casting: 'production',
  Designer: 'design',
  Motion: 'design',
};

const coverFor = (occupations: string[]): { img: string; label: string; key: CoverKey } => {
  const first = occupations[0];
  const key = (OCCUPATION_TO_GROUP[first] ?? 'visual') as CoverKey;
  return { ...COVER_GROUPS[key], key };
};

const initialsOf = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

type Work = {
  id: string;
  title: string;
  type: string;
  year: string;
  duration?: string;
  role: string;
  thumb: string;
  status?: 'new' | 'featured';
  description?: string;
};

// --- Page ---
const CreativeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'works' | 'about' | 'credits' | 'gigs'>('works');

  const { data: creative, isLoading } = useQuery({
    queryKey: ['creative-profile', id],
    enabled: !!id,
    queryFn: async () => {
      const [profileRes, collabRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, city, email, instagram_handle, bio, edition_id, editions(name)').eq('id', id!).single(),
        supabase.from('collaborator_profiles').select('tagline, occupations, about, intro, available_for_hire, portfolio_url').eq('user_id', id!).maybeSingle(),
      ]);
      if (profileRes.error) throw profileRes.error;
      const p = profileRes.data as any;
      const cp = collabRes.data as any;
      return {
        id: p.id,
        name: p.full_name || 'Unknown',
        avatar: p.avatar_url || undefined,
        city: p.city || '',
        email: p.email || '',
        instagram: p.instagram_handle || '',
        cohort: p.editions?.name || '',
        tagline: cp?.tagline || '',
        about: cp?.about || cp?.intro || p.bio || '',
        occupations: cp?.occupations || [],
        available: cp?.available_for_hire ?? false,
        portfolioUrl: cp?.portfolio_url || '',
      };
    },
  });

  // Check if already following
  const { data: isFollowing } = useQuery({
    queryKey: ['is-following', user?.id, id],
    enabled: !!user?.id && !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .eq('saved_user_id', id!)
        .maybeSingle();
      return !!data;
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !id) throw new Error('Not authenticated');
      if (isFollowing) {
        await supabase.from('saved_profiles').delete().eq('user_id', user.id).eq('saved_user_id', id);
      } else {
        await supabase.from('saved_profiles').insert({ user_id: user.id, saved_user_id: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, id] });
      toast.success(isFollowing ? 'Unfollowed' : 'Following!');
    },
  });

  const { data: works = [] } = useQuery({
    queryKey: ['creative-works', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborator_works')
        .select('id, title, description, year, work_type')
        .eq('user_id', id!)
        .order('order_index', { ascending: true });
      // Craft-based cover images as fallback thumbnails (no thumbnail_url in DB yet)
      const craftThumbs: Record<string, string> = {
        Film:  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
        Short: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
        Music: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
        Ad:    'https://images.unsplash.com/photo-1542204625-ca960aabb8e7?w=800',
        Doc:   'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800',
        Photo: 'https://images.unsplash.com/photo-1461773518188-b3e86f98242f?w=800',
      };
      return (data || []).map((w: any) => ({
        id: w.id,
        title: w.title || 'Untitled',
        type: w.work_type || 'Film',
        year: w.year ? String(w.year) : '',
        role: '—',
        thumb: craftThumbs[w.work_type] || craftThumbs['Film'],
        description: w.description || '',
      }));
    },
  });

  // Gigs this person has posted (for the "Gigs posted" tab)
  const { data: gigs = [] } = useQuery({
    queryKey: ['creative-gigs', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('gigs')
        .select('id, title, description, budget, location, gig_type, pay_type, status, created_at')
        .eq('user_id', id!)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const c = creative;
  if (!c) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Profile not found.
      </div>
    );
  }

  const cover = coverFor(c.occupations.length > 0 ? c.occupations : ['Director']);
  const isOwnProfile = user?.id === id;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to community
        </button>
      </div>

      {/* Hero banner — standardised cover per craft group */}
      <div className="relative h-[320px] overflow-hidden md:h-[380px]">
        <img src={cover.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/50 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,hsl(41_100%_62%/0.18),transparent_55%)]" />
        {/* Craft-group chip on the cover */}
        <div className="absolute right-6 top-6 lg:right-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(41_100%_62%)]" />
            {cover.label}{c.occupations[0] ? ` · ${c.occupations[0]}` : ''}
          </span>
        </div>
      </div>

      <main className="mx-auto -mt-24 grid w-full max-w-[1400px] grid-cols-12 gap-6 px-6 lg:px-12 pb-32 md:-mt-28">
        {/* Left sidebar */}
        <aside className="col-span-12 space-y-4 lg:col-span-4">
          {/* Profile card */}
          <section className="relative rounded-2xl border border-border/40 bg-card/95 p-6 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <button
              aria-label="Share"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <div className="relative">
              <div className="relative h-28 w-28 -mt-16 overflow-hidden rounded-full ring-4 ring-card shadow-2xl">
                {c.avatar ? (
                  <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10 text-3xl text-primary">{initialsOf(c.name)}</div>
                )}
              </div>
              {c.available && (
                <span className="absolute -bottom-1 left-20 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-card shadow-[0_0_10px_hsl(41_100%_62%)]">
                  <span className="h-2 w-2 rounded-full bg-background animate-pulse" />
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-foreground">{c.name}</h1>
            {c.city && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {c.city}
              </div>
            )}

            {c.about && (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{c.about}</p>
            )}

            <div className="mt-6 space-y-3 border-t border-border/40 pt-5 text-sm">
              {c.email && (
                <div className="flex items-center gap-3 text-foreground/90">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${c.email}`} className="hover:text-primary transition-colors">{c.email}</a>
                </div>
              )}
              {c.portfolioUrl && (
                <div className="flex items-center gap-3 text-foreground/90">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={c.portfolioUrl.startsWith('http') ? c.portfolioUrl : `https://${c.portfolioUrl}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">{c.portfolioUrl}</a>
                </div>
              )}
              {c.instagram && (
                <div className="flex items-center gap-3 text-foreground/90">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <span className="hover:text-primary transition-colors cursor-pointer">@{c.instagram}</span>
                </div>
              )}
              <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Plus className="h-4 w-4" /> Add link
              </button>
            </div>

            {!isOwnProfile && (
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(41_100%_62%/0.5)]"
                  onClick={() => navigate('/community?tab=chat')}
                >
                  Message
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/30 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-50"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </section>

          {/* Availability card */}
          <section className="rounded-2xl border border-border/40 bg-card/60 p-6">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              c.available ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {c.available ? 'Available for Hire' : 'Not Available for Hire'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c.available
                ? `${c.name.split(' ')[0]} is open to project work and listed in the Forge professional network.`
                : `${c.name.split(' ')[0]} is currently busy. Send a message to ask about future availability.`}
            </p>
            <button className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
              c.available
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border/60 text-foreground hover:border-primary/60 hover:text-primary'
            )}>
              {c.available ? 'Hire ' + c.name.split(' ')[0] : 'Request availability'}
            </button>
          </section>

          {/* Roles card */}
          {c.occupations.length > 0 && (
            <section className="rounded-2xl border border-border/40 bg-card/60 p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Roles</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.occupations.map((o: string) => (
                  <span key={o} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/30 px-3 py-1.5 text-xs font-medium text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {o}
                  </span>
                ))}
                <button className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors">
                  <Plus className="h-3 w-3" /> Add role
                </button>
              </div>
            </section>
          )}

        </aside>

        {/* Right main */}
        <section className="col-span-12 lg:col-span-8">
          {/* Sub-nav tabs */}
          <div className="mt-4 flex items-end justify-between border-b border-border/40">
            <ul className="flex gap-6 sm:gap-8">
              {([
                ['works', 'Works'],
                ['about', 'About'],
                ['credits', 'Credits'],
                ['gigs', 'Gigs posted'],
              ] as const).map(([key, label]) => {
                const active = activeTab === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => setActiveTab(key)}
                      className={cn(
                        'relative pb-3 text-sm transition-colors',
                        active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                      {active && (
                        <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_hsl(41_100%_62%/0.7)]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden sm:flex items-center gap-2 pb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Sort:</span>
              <button className="text-foreground border-b border-primary pb-0.5">Newest</button>
              <span className="text-muted-foreground/40">·</span>
              <button className="hover:text-foreground transition-colors">Most viewed</button>
            </div>
          </div>

          {/* ── Works tab ──────────────────────────────────────────── */}
          {activeTab === 'works' && (
            <>
              <h2 className="mt-6 text-2xl font-semibold text-foreground">
                Works
                <span className="ml-3 text-sm font-normal text-muted-foreground">— shot, cut, scored, or shipped by {c.name.split(' ')[0]}.</span>
              </h2>

              {works.length === 0 ? (
                <EmptyTab title="No works yet" body={`${c.name.split(' ')[0]} hasn't added any works to their profile.`} />
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {works.map((w, i) => (
                    <WorkCard key={w.id} w={w} feature={i === 0} />
                  ))}
                </div>
              )}

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-dashed border-border/50 bg-card/30 p-6">
                <div>
                  <div className="text-sm font-semibold text-foreground">Want to see more of {c.name.split(' ')[0]}&apos;s work?</div>
                  <div className="mt-1 text-xs text-muted-foreground">Request a private reel — shows unlisted projects and works-in-progress.</div>
                </div>
                <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Request reel <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {/* ── About tab ──────────────────────────────────────────── */}
          {activeTab === 'about' && (
            <div className="mt-6 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">About {c.name.split(' ')[0]}</h2>
                {c.about ? (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{c.about}</p>
                ) : (
                  <EmptyTab title="Nothing here yet" body={`${c.name.split(' ')[0]} hasn't written a bio yet.`} />
                )}
              </div>

              {c.occupations.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Crafts</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.occupations.map((o: string) => (
                      <span key={o} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/30 px-3 py-1.5 text-xs font-medium text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />{o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {c.cohort && <InfoRow label="Cohort" value={c.cohort} />}
                {c.city && <InfoRow label="Based in" value={c.city} />}
                {c.email && <InfoRow label="Email" value={c.email} />}
                {c.instagram && <InfoRow label="Instagram" value={`@${c.instagram}`} />}
              </div>
            </div>
          )}

          {/* ── Credits tab ────────────────────────────────────────── */}
          {activeTab === 'credits' && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-foreground">Credits</h2>
              {works.length === 0 ? (
                <EmptyTab title="No credits yet" body={`${c.name.split(' ')[0]} hasn't listed any credits.`} />
              ) : (
                <ul className="mt-6 divide-y divide-border/40 rounded-2xl border border-border/40 bg-card/40">
                  {works.map((w) => (
                    <li key={w.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{w.title}</div>
                        {w.description && <div className="mt-0.5 truncate text-xs text-muted-foreground">{w.description}</div>}
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border/60 px-2.5 py-1 uppercase tracking-[0.15em]">{w.type}</span>
                        {w.year && <span>{w.year}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Gigs posted tab ────────────────────────────────────── */}
          {activeTab === 'gigs' && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-foreground">Gigs posted</h2>
              {gigs.length === 0 ? (
                <EmptyTab title="No gigs posted" body={`${c.name.split(' ')[0]} hasn't posted any gigs yet.`} />
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {gigs.map((g: any) => (
                    <article key={g.id} className="rounded-2xl border border-border/40 bg-card/60 p-5 transition-colors hover:border-primary/40">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-foreground">{g.title}</h3>
                        {g.status && (
                          <span className="shrink-0 rounded-full border border-border/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{g.status}</span>
                        )}
                      </div>
                      {g.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{g.description}</p>}
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {g.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{g.location}</span>}
                        {g.budget && <span>{g.pay_type ? `${g.pay_type}: ` : ''}{g.budget}</span>}
                        {g.gig_type && <span className="rounded-full border border-border/60 px-2 py-0.5">{g.gig_type}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};


// --- Shared empty state for tabs ---
const EmptyTab: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="mt-6 flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/50 bg-card/30">
    <p className="mb-1 text-lg font-semibold text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground">{body}</p>
  </div>
);

// --- Labelled info row (About tab) ---
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
    <div className="mt-1 truncate text-sm font-medium text-foreground">{value}</div>
  </div>
);

// --- Work card ---
const WorkCard: React.FC<{ w: Work; feature?: boolean }> = ({ w, feature }) => (
  <article className={cn(
    'group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all hover:border-primary/40 hover:-translate-y-0.5',
    feature && 'sm:col-span-2'
  )}>
    <div className={cn('relative overflow-hidden', feature ? 'aspect-[16/8]' : 'aspect-video')}>
      <img src={w.thumb} alt={w.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top badges */}
      <div className="absolute left-4 top-4 flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
          {w.type}
        </span>
        {w.status === 'featured' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Star className="h-2.5 w-2.5" /> Featured
          </span>
        )}
        {w.status === 'new' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> New
          </span>
        )}
      </div>


      {/* Play button */}
      <button
        aria-label={`Play ${w.title}`}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-[0_0_30px_hsl(41_100%_62%/0.5)] transition-transform duration-300 group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5 fill-current" />
        </span>
      </button>

      {/* Bottom title overlay (visible on hover) */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-xl font-semibold leading-tight text-white">{w.title}</h3>
        <div className="mt-1 text-xs text-white/70">{w.role}</div>
      </div>
    </div>
  </article>
);

export default CreativeProfile;
