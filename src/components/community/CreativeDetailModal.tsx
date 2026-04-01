import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Briefcase, Globe } from 'lucide-react';
import type { CreativeProfile } from './CreativeCard';

interface CreativeDetailModalProps {
  profile: CreativeProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeDetailModal: React.FC<CreativeDetailModalProps> = ({ profile, open, onOpenChange }) => {
  if (!profile) return null;

  const initials = (profile.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-2 border-background">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base">{profile.full_name}</DialogTitle>
              {profile.tagline && <p className="text-xs text-muted-foreground mt-0.5">{profile.tagline}</p>}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {profile.city && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {profile.city}
              {profile.edition_name && <span className="text-xs">· {profile.edition_name}</span>}
            </p>
          )}

          {profile.occupations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.occupations.map(occ => (
                <span key={occ} className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{occ}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {profile.available_for_hire && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500">
                <Briefcase className="w-3 h-3" /> Available for hire
              </span>
            )}
            {profile.open_to_remote && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500">
                <Globe className="w-3 h-3" /> Remote OK
              </span>
            )}
          </div>

          {profile.about && (
            <p className="text-sm text-foreground leading-relaxed">{profile.about}</p>
          )}

          {profile.portfolio_url && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> View {profile.portfolio_type || 'Portfolio'}
              </a>
            </Button>
          )}

          {profile.portfolio_slug && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={`/p/${profile.portfolio_slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> View Forge Portfolio
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
