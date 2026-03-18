import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Globe, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface CreativeProfile {
  user_id: string;
  intro: string | null;
  tagline: string | null;
  about: string | null;
  occupations: string[];
  open_to_remote: boolean;
  available_for_hire: boolean;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  edition_name: string | null;
  cohort_type: string | null;
  works_count: number;
  portfolio_slug: string | null;
  portfolio_url: string | null;
  portfolio_type: string | null;
  last_active_at: string | null;
  edition_id: string | null;
}

interface CreativeCardProps {
  profile: CreativeProfile;
  onClick: () => void;
}

const getCohortRing = (type: string | null) => {
  switch (type) {
    case 'FORGE': return 'ring-primary';
    case 'FORGE_CREATORS': return 'ring-pink-400';
    case 'FORGE_WRITING': return 'ring-emerald-400';
    default: return 'ring-border';
  }
};

const getCohortBadge = (type: string | null) => {
  switch (type) {
    case 'FORGE': return 'bg-primary/10 text-primary border-primary/20';
    case 'FORGE_CREATORS': return 'bg-pink-400/10 text-pink-400 border-pink-400/20';
    case 'FORGE_WRITING': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    default: return 'bg-muted text-muted-foreground border-border/30';
  }
};

const isRecentlyActive = (lastActive: string | null) => {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 7 * 24 * 60 * 60 * 1000;
};

export const CreativeCard: React.FC<CreativeCardProps> = ({ profile, onClick }) => {
  const active = isRecentlyActive(profile.last_active_at);
  const initials = (profile.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/30 bg-card p-4 space-y-3 hover:border-primary/30 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className={cn('w-12 h-12 ring-2 ring-offset-2 ring-offset-background', getCohortRing(profile.cohort_type))}>
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
            <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          {active && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{profile.full_name || 'Unknown'}</h3>
          {profile.tagline && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{profile.tagline}</p>}
          {profile.city && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 shrink-0" />{profile.city}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          {profile.available_for_hire && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              Hiring
            </span>
          )}
          {profile.open_to_remote && (
            <span className="text-[10px] text-primary flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5" /> Remote
            </span>
          )}
        </div>
      </div>

      {profile.intro && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">"{profile.intro}"</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {profile.occupations.slice(0, 3).map((occ) => (
          <span key={occ} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/5 text-primary/80 border border-primary/15">
            {occ}
          </span>
        ))}
        {profile.occupations.length > 3 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground">
            +{profile.occupations.length - 3}
          </span>
        )}
      </div>

      {profile.edition_name && (
        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium border w-fit', getCohortBadge(profile.cohort_type))}>
          <Briefcase className="w-3 h-3 shrink-0" />
          {profile.edition_name}
        </div>
      )}
    </button>
  );
};
