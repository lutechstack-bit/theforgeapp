import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContactPitchModal } from './ContactPitchModal';
import { MapPin, Globe, Briefcase, ExternalLink, MessageCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { CreativeProfile } from './CreativeCard';

interface CreativeDetailModalProps {
  profile: CreativeProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeDetailModal: React.FC<CreativeDetailModalProps> = ({ profile, open, onOpenChange }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

  const { data: works = [] } = useQuery({
    queryKey: ['creative-works', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];
      const { data } = await supabase
        .from('collaborator_works')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('order_index');
      return data || [];
    },
    enabled: !!profile?.user_id && open,
  });

  const { data: isSaved, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-profile', user?.id, profile?.user_id],
    queryFn: async () => {
      if (!user || !profile) return false;
      const { data } = await supabase
        .from('saved_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('saved_user_id', profile.user_id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!profile?.user_id && open,
  });

  const toggleSave = async () => {
    if (!user || !profile) return;
    if (isSaved) {
      await supabase.from('saved_profiles').delete().eq('user_id', user.id).eq('saved_user_id', profile.user_id);
      toast.success('Removed from saved');
    } else {
      await supabase.from('saved_profiles').insert({ user_id: user.id, saved_user_id: profile.user_id });
      toast.success('Profile saved');
    }
    refetchSaved();
  };

  if (!profile) return null;

  const initials = (profile.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2);
  const isOwnProfile = user?.id === profile.user_id;

  const content = (
    <div className="space-y-5 p-1">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-lg font-bold bg-muted">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">{profile.full_name}</h2>
          {profile.tagline && <p className="text-sm text-muted-foreground mt-0.5">{profile.tagline}</p>}
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
            {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city}</span>}
            {profile.open_to_remote && <span className="flex items-center gap-1 text-primary"><Globe className="w-3 h-3" />Remote</span>}
            {profile.available_for_hire && <span className="flex items-center gap-1 text-emerald-400"><Briefcase className="w-3 h-3" />Available</span>}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="flex flex-wrap gap-1.5">
        {profile.occupations.map((occ) => (
          <span key={occ} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/5 text-primary/80 border border-primary/15">
            {occ}
          </span>
        ))}
      </div>

      {/* About */}
      {(profile.about || profile.intro) && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.about || profile.intro}</p>
        </div>
      )}

      {/* Edition */}
      {profile.edition_name && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/30">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{profile.edition_name}</span>
        </div>
      )}

      {/* Works */}
      {works.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Work</h3>
          <div className="space-y-2">
            {works.map((w) => (
              <div key={w.id} className="p-3 rounded-lg border border-border/30 bg-card/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{w.title}</p>
                  {w.year && <span className="text-[10px] text-muted-foreground">{w.year}</span>}
                </div>
                {w.work_type && <p className="text-[11px] text-primary/70 mt-0.5">{w.work_type}</p>}
                {w.description && <p className="text-xs text-muted-foreground mt-1">{w.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio link */}
      {profile.portfolio_url && (
        <a
          href={profile.portfolio_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 text-primary text-sm hover:bg-primary/5 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {profile.portfolio_type || 'Portfolio'}
        </a>
      )}

      {/* Actions */}
      {!isOwnProfile && (
        <div className="flex gap-2 pt-2">
          <Button onClick={() => setContactOpen(true)} className="flex-1 gap-2">
            <MessageCircle className="w-4 h-4" /> Contact
          </Button>
          <Button variant="outline" onClick={toggleSave} className="gap-2">
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      )}

      <ContactPitchModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        recipientId={profile.user_id}
        recipientName={profile.full_name || 'Unknown'}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85dvh] px-4 pb-6 pt-4">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
};
