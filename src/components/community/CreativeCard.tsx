import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onClick?: () => void;
}

export const CreativeCard: React.FC<CreativeCardProps> = ({ profile, onClick }) => {
  const initials = (profile.full_name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 border-2 border-background shrink-0">
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'Creative'} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{profile.full_name || 'Creative'}</h3>
            {profile.available_for_hire && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-500 shrink-0">HIRE</span>
            )}
          </div>
          {profile.tagline && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{profile.tagline}</p>
          )}
          {profile.city && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {profile.city}
            </p>
          )}
        </div>
      </div>
      {profile.occupations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {profile.occupations.slice(0, 3).map(occ => (
            <span key={occ} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {occ}
            </span>
          ))}
          {profile.occupations.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-muted-foreground">+{profile.occupations.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
};
