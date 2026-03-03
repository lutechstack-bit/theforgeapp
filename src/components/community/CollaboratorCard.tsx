import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Briefcase, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    case 'FORGE': return 'ring-amber-400';
    case 'FORGE_CREATORS': return 'ring-pink-400';
    case 'FORGE_WRITING': return 'ring-emerald-400';
    default: return 'ring-border';
  }
};

const getCohortBadgeColor = (type: string | null) => {
  switch (type) {
    case 'FORGE': return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
    case 'FORGE_CREATORS': return 'bg-pink-400/10 text-pink-400 border-pink-400/30';
    case 'FORGE_WRITING': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const isRecentlyActive = (lastActive: string | null) => {
  if (!lastActive) return false;
  const diff = Date.now() - new Date(lastActive).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
};

export const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ profile, onContact }) => {
  const active = isRecentlyActive(profile.last_active_at);
  const initials = (profile.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3 hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className={cn('w-12 h-12 ring-2', getCohortRingColor(profile.cohort_type))}>
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || ''} />
          <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">{profile.full_name || 'Unknown'}</h3>
            {active && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400" title="Active recently" />
            )}
          </div>
          {profile.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{profile.city}
            </p>
          )}
        </div>
        {profile.open_to_remote && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1 shrink-0 border-primary/30 text-primary">
            <Globe className="w-2.5 h-2.5" /> Remote
          </Badge>
        )}
      </div>

      {/* Intro */}
      {profile.intro && (
        <p className="text-xs text-muted-foreground italic leading-relaxed">"{profile.intro}"</p>
      )}

      {/* Occupations */}
      <div className="flex flex-wrap gap-1.5">
        {profile.occupations.slice(0, 4).map((occ) => (
          <span key={occ} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground border border-border/30">
            {occ}
          </span>
        ))}
      </div>

      {/* Edition Badge */}
      {profile.edition_name && (
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border', getCohortBadgeColor(profile.cohort_type))}>
          <Briefcase className="w-2.5 h-2.5" />
          {profile.edition_name}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" variant="default" className="flex-1 h-8 text-xs" onClick={() => onContact(profile.user_id)}>
          Contact
        </Button>
        {profile.portfolio_slug && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={() => window.open(`/portfolio/${profile.portfolio_slug}`, '_blank')}
          >
            Portfolio
          </Button>
        )}
      </div>
    </div>
  );
};
