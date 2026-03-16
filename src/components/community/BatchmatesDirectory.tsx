import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchmateDetailSheet } from './BatchmateDetailSheet';
import { Search, MapPin } from 'lucide-react';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

interface Batchmate {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
  instagram_handle: string | null;
}

export const BatchmatesDirectory: React.FC = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Batchmate | null>(null);

  const { data: batchmates, isLoading } = useQuery({
    queryKey: ['batchmates-directory', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_batchmates_for_my_edition');
      if (error) throw error;
      return (data || []) as Batchmate[];
    },
    enabled: !!profile?.edition_id,
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!batchmates) return [];
    if (!search.trim()) return batchmates;
    const q = search.toLowerCase();
    return batchmates.filter(
      m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.city?.toLowerCase().includes(q) ||
        m.specialty?.toLowerCase().includes(q)
    );
  }, [batchmates, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!batchmates?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">No batchmates found yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, city, or specialty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-card border-border/30"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} batchmate{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(member => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/30 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-center group"
          >
            <Avatar className="w-14 h-14 border-2 border-border/30 group-hover:border-primary/40 transition-colors">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
              <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 w-full">
              <p className="text-sm font-semibold text-foreground truncate">
                {member.full_name || 'Unknown'}
              </p>
              {member.city && (
                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{member.city}</span>
                </p>
              )}
              {member.specialty && (
                <Badge variant="secondary" className="text-[10px] mt-1.5 max-w-full truncate">
                  {member.specialty}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>

      <BatchmateDetailSheet
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
