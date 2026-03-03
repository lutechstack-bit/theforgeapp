import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CollaboratorCard } from './CollaboratorCard';
import { CollaboratorRequestModal } from './CollaboratorRequestModal';
import { CollaboratorInbox } from './CollaboratorInbox';
import { FloatingInput } from '@/components/ui/floating-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CollaboratorDirectory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [contactUserId, setContactUserId] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');

  // Fetch occupations for filter pills
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

  // Fetch published collaborator profiles with joined data
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['collaborator-directory'],
    queryFn: async () => {
      const { data: colabProfiles, error } = await supabase
        .from('collaborator_profiles')
        .select('*')
        .eq('is_published', true);
      if (error) throw error;
      if (!colabProfiles?.length) return [];

      const userIds = colabProfiles.map(c => c.user_id);

      // Fetch profiles, editions, portfolios, works counts in parallel
      const [profilesRes, portfoliosRes, worksRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, city, edition_id, last_active_at').in('id', userIds),
        supabase.from('public_portfolios').select('user_id, slug, is_public').in('user_id', userIds).eq('is_public', true),
        supabase.from('collaborator_works').select('user_id').in('user_id', userIds),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const portfolioMap = new Map((portfoliosRes.data || []).map(p => [p.user_id, p.slug]));
      
      // Count works per user
      const worksCountMap = new Map<string, number>();
      (worksRes.data || []).forEach(w => {
        worksCountMap.set(w.user_id, (worksCountMap.get(w.user_id) || 0) + 1);
      });

      // Fetch editions for users that have edition_id
      const editionIds = [...new Set((profilesRes.data || []).map(p => p.edition_id).filter(Boolean))];
      let editionMap = new Map<string, { name: string; cohort_type: string }>();
      if (editionIds.length > 0) {
        const { data: editions } = await supabase.from('editions').select('id, name, cohort_type').in('id', editionIds);
        editionMap = new Map((editions || []).map(e => [e.id, { name: e.name, cohort_type: e.cohort_type }]));
      }

      return colabProfiles.map(cp => {
        const p = profileMap.get(cp.user_id);
        const edition = p?.edition_id ? editionMap.get(p.edition_id) : null;
        return {
          user_id: cp.user_id,
          intro: cp.intro,
          occupations: cp.occupations || [],
          open_to_remote: cp.open_to_remote || false,
          full_name: p?.full_name || null,
          avatar_url: p?.avatar_url || null,
          city: p?.city || null,
          edition_name: edition?.name || null,
          cohort_type: edition?.cohort_type || null,
          works_count: worksCountMap.get(cp.user_id) || 0,
          portfolio_slug: portfolioMap.get(cp.user_id) || null,
          last_active_at: p?.last_active_at || null,
        };
      });
    },
  });

  // Check if current user has a collaborator profile
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
    if (activeFilter !== 'ALL') {
      result = result.filter(c => c.occupations.includes(activeFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.occupations.some(o => o.toLowerCase().includes(q)) ||
        c.intro?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [collaborators, activeFilter, search]);

  const handleContact = (userId: string) => {
    const collaborator = collaborators.find(c => c.user_id === userId);
    setContactUserId(userId);
    setContactName(collaborator?.full_name || 'Unknown');
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Creative Network
          </h2>
          <p className="text-xs text-muted-foreground">{collaborators.length} creators published</p>
        </div>
        <CollaboratorInbox />
      </div>

      {/* CTA Banner */}
      {!hasProfile && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Join the network</p>
            <p className="text-xs text-muted-foreground">Set up your collaborator profile</p>
          </div>
          <Button size="sm" onClick={() => navigate('/collaborator-setup')}>Set Up</Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, or city..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border/50 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap shrink-0',
            activeFilter === 'ALL'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted/30 text-muted-foreground border-border/50'
          )}
        >
          All
        </button>
        {occupations.map((occ) => (
          <button
            key={occ.id}
            onClick={() => setActiveFilter(occ.name)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap shrink-0',
              activeFilter === occ.name
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/30 text-muted-foreground border-border/50'
            )}
          >
            {occ.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No collaborators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((c) => (
              <CollaboratorCard key={c.user_id} profile={c} onContact={handleContact} />
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {contactUserId && (
        <CollaboratorRequestModal
          open={!!contactUserId}
          onOpenChange={(open) => { if (!open) setContactUserId(null); }}
          recipientId={contactUserId}
          recipientName={contactName}
        />
      )}
    </div>
  );
};
