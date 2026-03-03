import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Briefcase, Globe, MessageCircle, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollaboratorCardProps {
  profile: {
    user_id: string;
    intro: string | null;
    occupations: string[];
    open_to_remote: boolean;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    edition_name: string | null;
    cohort_type: string | null;
    works_count: number;
    portfolio_slug: string | null;
    last_active_at: string | null;
  };
  onContact: (userId: string) => void;
}

const getCohortRingColor = (type: string | null) => {
  switch (type) {
    case 'FORGE': return 'ring-[#FFBF00]';
    case 'FORGE_CREATORS': return 'ring-pink-400';
    case 'FORGE_WRITING': return 'ring-emerald-400';
    default: return 'ring-border';
  }
};

const getCohortBadgeStyle = (type: string | null) => {
  switch (type) {
    case 'FORGE': return 'bg-[#FFBF00]/10 text-[#FFBF00] border-[#FFBF00]/20';
    case 'FORGE_CREATORS': return 'bg-pink-400/10 text-pink-400 border-pink-400/20';
    case 'FORGE_WRITING': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    default: return 'bg-muted text-muted-foreground border-border/30';
  }
};

const isRecentlyActive = (lastActive: string | null) => {
  if (!lastActive) return false;
  const diff = Date.now() - new Date(lastActive).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
};

export const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ profile, onContact }) => {
  const active = isRecentlyActive(profile.last_active_at);
  const initials = (profile.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="rounded-xl border border-border/30 bg-card p-5 space-y-4 hover:border-[#FFBF00]/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="relative">
          <Avatar className={cn('w-14 h-14 ring-[3px] ring-offset-2 ring-offset-background', getCohortRingColor(profile.cohort_type))}>
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
            <AvatarFallback className="text-sm font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          {active && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base truncate">{profile.full_name || 'Unknown'}</h3>
          {profile.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />{profile.city}
            </p>
          )}
          {profile.open_to_remote && (
            <p className="text-[11px] text-[#FFBF00] flex items-center gap-1 mt-1 font-medium">
              <Globe className="w-3 h-3" /> Open to remote
            </p>
          )}
        </div>
      </div>

      {/* Intro */}
      {profile.intro && (
        <p className="text-sm text-muted-foreground italic leading-relaxed">"{profile.intro}"</p>
      )}

      {/* Occupations */}
      <div className="flex flex-wrap gap-1.5">
        {profile.occupations.slice(0, 4).map((occ) => (
          <span key={occ} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFBF00]/5 text-[#FFBF00]/80 border border-[#FFBF00]/15">
            {occ}
          </span>
        ))}
      </div>

      {/* Edition Badge */}
      {profile.edition_name && (
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border', getCohortBadgeStyle(profile.cohort_type))}>
          <Briefcase className="w-3 h-3 shrink-0" />
          {profile.edition_name}
        </div>
      )}

      {/* Separator */}
      <div className="border-t border-border/20" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onContact(profile.user_id)}
          className="flex-1 h-10 rounded-lg bg-[#FFBF00] text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#FFBF00]/90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Contact
        </button>
        {profile.portfolio_slug && (
          <button
            onClick={() => window.open(`/portfolio/${profile.portfolio_slug}`, '_blank')}
            className="flex-1 h-10 rounded-lg border border-[#FFBF00]/20 text-[#FFBF00] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#FFBF00]/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Portfolio
          </button>
        )}
      </div>
    </div>
  );
};
