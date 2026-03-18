import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreativeCard, type CreativeProfile } from './CreativeCard';
import { CreativeDetailModal } from './CreativeDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreativesDirectoryProps {
  onSetupProfile: () => void;
}

export const CreativesDirectory: React.FC<CreativesDirectoryProps> = ({ onSetupProfile }) => {
  const { user, profile, edition } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'cohort'>('all');
  const [selectedProfile, setSelectedProfile] = useState<CreativeProfile | null>(null);

  const { data: occupations = [] } = useQuery({
    queryKey: ['collaborator-occupations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborator_occupations')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      return data || [];
    },
  });

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['creatives-directory'],
    queryFn: async () => {
      const { data: colabProfiles, error } = await supabase
        .from('collaborator_profiles')
        .select('*')
        .eq('is_published', true);
      if (error) throw error;
      if (!colabProfiles?.length) return [];

      const userIds = colabProfiles.map(c => c.user_id);
      const [profilesRes, portfoliosRes, worksRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, city, edition_id, last_active_at').in('id', userIds),
        supabase.from('public_portfolios').select('user_id, slug, is_public').in('user_id', userIds).eq('is_public', true),
        supabase.from('collaborator_works').select('user_id').in('user_id', userIds),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const portfolioMap = new Map((portfoliosRes.data || []).map(p => [p.user_id, p.slug]));
      const worksCountMap = new Map<string, number>();
      (worksRes.data || []).forEach(w => {
        worksCountMap.set(w.user_id, (worksCountMap.get(w.user_id) || 0) + 1);
      });

      const editionIds = [...new Set((profilesRes.data || []).map(p => p.edition_id).filter(Boolean))];
      let editionMap = new Map<string, { name: string; cohort_type: string }>();
      if (editionIds.length > 0) {
        const { data: editions } = await supabase.from('editions').select('id, name, cohort_type').in('id', editionIds);
        editionMap = new Map((editions || []).map(e => [e.id, { name: e.name, cohort_type: e.cohort_type }]));
      }

      return colabProfiles.map(cp => {
        const p = profileMap.get(cp.user_id);
        const ed = p?.edition_id ? editionMap.get(p.edition_id) : null;
        return {
          user_id: cp.user_id,
          intro: cp.intro,
          tagline: cp.tagline,
          about: cp.about,
          occupations: cp.occupations || [],
          open_to_remote: cp.open_to_remote || false,
          available_for_hire: cp.available_for_hire || false,
          full_name: p?.full_name || null,
          avatar_url: p?.avatar_url || null,
          city: p?.city || null,
          edition_name: ed?.name || null,
          cohort_type: ed?.cohort_type || null,
          works_count: worksCountMap.get(cp.user_id) || 0,
          portfolio_slug: portfolioMap.get(cp.user_id) || null,
          portfolio_url: cp.portfolio_url || null,
          portfolio_type: cp.portfolio_type || null,
          last_active_at: p?.last_active_at || null,
          edition_id: p?.edition_id || null,
        } as CreativeProfile;
      });
    },
  });

  const { data: hasProfile } = useQuery({
    queryKey: ['has-collaborator-profile', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('collaborator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_published', true)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    let result = collaborators;
    if (cohortFilter === 'cohort' && profile?.edition_id) {
      result = result.filter(c => c.edition_id === profile.edition_id);
    }
    if (activeFilter !== 'ALL') {
      result = result.filter(c => c.occupations.includes(activeFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.occupations.some(o => o.toLowerCase().includes(q)) ||
        c.intro?.toLowerCase().includes(q) ||
        c.tagline?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [collaborators, cohortFilter, activeFilter, search, profile?.edition_id]);

  const cohortCount = useMemo(() => {
    if (!profile?.edition_id) return 0;
    return collaborators.filter(c => c.edition_id === profile.edition_id).length;
  }, [collaborators, profile?.edition_id]);

  return (
    <div className="flex flex-col gap-3">
      {/* CTA Banner */}
      {!hasProfile && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border-l-2 border-primary/60 border-y border-r border-border/30 bg-card">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Join the creative network</p>
            <p className="text-xs text-muted-foreground">Set up your profile in 2 minutes</p>
          </div>
          <button
            onClick={onSetupProfile}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shrink-0 active:scale-95 transition-all"
          >
            Set Up
          </button>
        </div>
      )}

      {/* Cohort Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setCohortFilter('all')}
          className={cn(
            'px-3.5 py-2 rounded-full text-xs font-semibold transition-all border active:scale-95',
            cohortFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border/30 hover:border-border/60'
          )}
        >
          All Creatives ({collaborators.length})
        </button>
        {profile?.edition_id && (
          <button
            onClick={() => setCohortFilter('cohort')}
            className={cn(
              'px-3.5 py-2 rounded-full text-xs font-semibold transition-all border active:scale-95 flex items-center gap-1',
              cohortFilter === 'cohort'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border/30 hover:border-border/60'
            )}
          >
            <Star className="w-3 h-3" /> Your Cohort ({cohortCount})
          </button>
        )}
      </div>

      {/* Cohort header */}
      {cohortFilter === 'cohort' && edition && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="w-3 h-3 text-primary" />
          <span>{edition.city} · {edition.cohort_type.replace(/_/g, ' ')} · {cohortCount} members</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, or city..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/30 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-colors"
        />
      </div>

      {/* Role Filters */}
      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide pr-8">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border whitespace-nowrap shrink-0 active:scale-95',
              activeFilter === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border/30'
            )}
          >
            All
          </button>
          {occupations.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setActiveFilter(occ.name)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border whitespace-nowrap shrink-0 active:scale-95',
                activeFilter === occ.name
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/30'
              )}
            >
              {occ.name}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No creatives found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <CreativeCard key={c.user_id} profile={c} onClick={() => setSelectedProfile(c)} />
          ))}
        </div>
      )}

      <CreativeDetailModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onOpenChange={(open) => { if (!open) setSelectedProfile(null); }}
      />
    </div>
  );
};
