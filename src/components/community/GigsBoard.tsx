import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GigCard, type GigData } from './GigCard';
import { GigPostForm } from './GigPostForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GigsBoard: React.FC = () => {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('ALL');
  const [postFormOpen, setPostFormOpen] = useState(false);

  const { data: gigs = [], isLoading, refetch } = useQuery({
    queryKey: ['gigs-board'],
    queryFn: async () => {
      const { data: gigsData, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!gigsData?.length) return [];

      const userIds = [...new Set(gigsData.map(g => g.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return gigsData.map(g => {
        const poster = profileMap.get(g.user_id);
        return {
          ...g,
          roles_needed: g.roles_needed || [],
          poster_name: poster?.full_name || null,
          poster_avatar: poster?.avatar_url || null,
        } as GigData;
      });
    },
  });

  const filtered = useMemo(() => {
    let result = gigs;
    if (payFilter !== 'ALL') {
      result = result.filter(g => g.pay_type === payFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q) ||
        g.roles_needed.some(r => r.toLowerCase().includes(q))
      );
    }
    return result;
  }, [gigs, payFilter, search]);

  const payFilters = [
    { key: 'ALL', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'revenue_share', label: 'Revenue Share' },
    { key: 'credit_only', label: 'Credit' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Post Gig CTA */}
      <button
        onClick={() => setPostFormOpen(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" /> Post a Gig
      </button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gigs..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/30 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
        />
      </div>

      {/* Pay Filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {payFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setPayFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border whitespace-nowrap shrink-0 active:scale-95',
              payFilter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gigs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No gigs posted yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to post a gig!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((g) => (
            <GigCard key={g.id} gig={g} />
          ))}
        </div>
      )}

      <GigPostForm
        open={postFormOpen}
        onOpenChange={setPostFormOpen}
        onSuccess={() => { setPostFormOpen(false); refetch(); }}
      />
    </div>
  );
};
