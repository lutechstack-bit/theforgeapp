import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, MapPin } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { promiseWithTimeout } from '@/lib/promiseTimeout';
import { MemberModal } from '@/components/community/MemberModal';

interface BatchmatesSectionProps {
  title?: string;
  subtitle?: string;
}

interface Batchmate {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
}

/** Duplicate `arr` until its length is >= `min`, for seamless marquee looping */
function ensureEnough<T>(arr: T[], min = 16): T[] {
  if (arr.length === 0) return arr;
  const times = Math.ceil(min / arr.length);
  return Array.from({ length: times }, () => arr).flat();
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface BatchmateCardProps {
  member: Batchmate;
  headshot: string | null;
  cardKey: string;
  onClick: () => void;
}

const BatchmateCard: React.FC<BatchmateCardProps> = ({ member, headshot, cardKey, onClick }) => {
  const photoUrl = headshot || member.avatar_url;
  const firstName = member.full_name?.split(' ')[0] || '';
  const lastName = member.full_name?.split(' ').slice(1).join(' ') || '';

  return (
    <button
      key={cardKey}
      onClick={onClick}
      className="group flex-shrink-0 w-32 sm:w-36 rounded-2xl overflow-hidden relative border border-white/8 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Portrait frame — aspect-[3/4] */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={member.full_name || ''}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* No photo — show initials centered on textured bg */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-3xl font-black text-primary/80 tracking-tight select-none">
              {getInitials(member.full_name)}
            </span>
          </div>
        )}

        {/* Bottom gradient overlay — always present */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Specialty pill — top right, only when available */}
        {member.specialty && (
          <div className="absolute top-2 right-2">
            <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-semibold tracking-wide bg-primary/80 text-primary-foreground backdrop-blur-sm leading-tight max-w-[72px] truncate">
              {member.specialty}
            </span>
          </div>
        )}

        {/* Text overlay — pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6">
          <p className="text-[13px] font-bold text-white leading-tight truncate">
            {firstName}
            {lastName && (
              <span className="font-normal text-white/70"> {lastName}</span>
            )}
          </p>
          {member.city && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-white/40 flex-shrink-0" />
              <p className="text-[10px] text-white/50 truncate leading-tight">{member.city}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const BatchmatesSection: React.FC<BatchmatesSectionProps> = ({
  title = 'Your Batchmates',
  subtitle,
}) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [selectedMember, setSelectedMember] = useState<Batchmate | null>(null);

  // Fetch all batchmates (no limit)
  const { data: batchmates = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['batchmates', profile?.edition_id],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city, specialty')
          .eq('edition_id', profile!.edition_id!)
          .neq('id', user!.id)
          .then(res => res),
        10000,
        'batchmates'
      );
      if (result.error) throw result.error;
      return (result.data || []) as Batchmate[];
    },
    enabled: !!profile?.edition_id && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch KY headshots in parallel (silently falls back on error)
  const profileIds = useMemo(() => batchmates.map(b => b.id), [batchmates]);
  const { data: kyfData = [] } = useQuery({
    queryKey: ['kyf-headshots', profileIds],
    queryFn: async () => {
      if (profileIds.length === 0) return [];
      const { data, error } = await supabase
        .from('kyf_responses')
        .select('user_id, headshot_front_url')
        .in('user_id', profileIds);
      if (error) return [];
      return data || [];
    },
    enabled: profileIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const headshotMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const row of kyfData) {
      if (row.user_id && row.headshot_front_url) {
        map[row.user_id] = row.headshot_front_url;
      }
    }
    return map;
  }, [kyfData]);

  // Loading skeleton
  if (loadingProfiles) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-32 flex-shrink-0 rounded-2xl" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      </div>
    );
  }

  if (batchmates.length === 0) return null;

  // Duplicate array enough times for a seamless infinite loop
  const row1 = ensureEnough(batchmates, 16);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/community?tab=batchmates')}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Marquee container — single row, hover pauses */}
      <div className="marquee-pause overflow-hidden -mx-1">
        <div className="flex gap-3">
          <div className="flex gap-3 animate-marquee">
            {row1.map((member, i) => (
              <BatchmateCard
                key={`r1-${member.id}-${i}`}
                cardKey={`r1-${member.id}-${i}`}
                member={member}
                headshot={headshotMap[member.id] ?? null}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        </div>
      </div>

      <MemberModal
        member={selectedMember}
        isOnline={false}
        onClose={() => setSelectedMember(null)}
      />
    </section>
  );
};

export default BatchmatesSection;
