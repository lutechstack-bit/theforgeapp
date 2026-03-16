import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin, Instagram, Briefcase, Brain, Moon, Star, Film, Pen, Palette } from 'lucide-react';

interface BatchmateDetailSheetProps {
  member: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    specialty: string | null;
    instagram_handle: string | null;
  } | null;
  onClose: () => void;
}

const PROFICIENCY_MAP: Record<string, { label: string; value: number }> = {
  beginner: { label: 'Beginner', value: 25 },
  intermediate: { label: 'Intermediate', value: 50 },
  advanced: { label: 'Advanced', value: 75 },
  expert: { label: 'Expert', value: 100 },
};

const ProficiencyBar = ({ label, level }: { label: string; level: string | null }) => {
  const info = PROFICIENCY_MAP[level?.toLowerCase() || ''];
  if (!info) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{info.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${info.value}%` }}
        />
      </div>
    </div>
  );
};

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const BatchmateDetailSheet: React.FC<BatchmateDetailSheetProps> = ({ member, onClose }) => {
  const isMobile = useIsMobile();

  // Fetch full details via secure RPC
  const { data: details } = useQuery({
    queryKey: ['batchmate-details', member?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_batchmate_details', {
        member_id: member!.id,
      });
      if (error) throw error;
      return data as Record<string, any> | null;
    },
    enabled: !!member?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (!member) return null;

  const ky = details?.ky_data || {};
  const cohortType = details?.cohort_type || 'FORGE';

  const content = (
    <div className="space-y-5 pb-6 px-1">
      {/* Hero */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary/30">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground truncate">{member.full_name}</h3>
          {member.city && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {member.city}
            </p>
          )}
          {member.specialty && (
            <Badge variant="secondary" className="mt-1 text-xs">{member.specialty}</Badge>
          )}
        </div>
      </div>

      {/* Instagram */}
      {member.instagram_handle && (
        <a
          href={`https://instagram.com/${member.instagram_handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Instagram className="w-4 h-4" />
          @{member.instagram_handle.replace('@', '')}
        </a>
      )}

      {details && ky && (
        <>
          <Separator />

          {/* General Info */}
          {(() => {
            const occupation = ky.current_occupation || ky.current_status;
            const mbti = ky.mbti_type;
            const chronotype = ky.chronotype;

            if (!occupation && !mbti && !chronotype) return null;

            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> About
                </h4>
                <div className="flex flex-wrap gap-2">
                  {occupation && <Badge variant="outline" className="text-xs">{occupation}</Badge>}
                  {mbti && (
                    <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs">
                      <Brain className="w-3 h-3 mr-1" /> {mbti}
                    </Badge>
                  )}
                  {chronotype && (
                    <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs">
                      <Moon className="w-3 h-3 mr-1" /> {chronotype}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Proficiencies */}
          {(() => {
            let profs: { label: string; level: string | null }[] = [];
            let icon = <Film className="w-4 h-4 text-primary" />;

            if (cohortType === 'FORGE') {
              profs = [
                { label: 'Screenwriting', level: ky.proficiency_screenwriting },
                { label: 'Direction', level: ky.proficiency_direction },
                { label: 'Cinematography', level: ky.proficiency_cinematography },
                { label: 'Editing', level: ky.proficiency_editing },
              ].filter(p => p.level);
            } else if (cohortType === 'FORGE_CREATORS') {
              icon = <Palette className="w-4 h-4 text-primary" />;
              profs = [
                { label: 'Content Creation', level: ky.proficiency_content_creation },
                { label: 'Storytelling', level: ky.proficiency_storytelling },
                { label: 'Video Production', level: ky.proficiency_video_production },
              ].filter(p => p.level);
            } else {
              icon = <Pen className="w-4 h-4 text-primary" />;
              profs = [
                { label: 'Writing', level: ky.proficiency_writing },
                { label: 'Story & Voice', level: ky.proficiency_story_voice },
              ].filter(p => p.level);
            }

            if (!profs.length) return null;
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {icon} Proficiencies
                </h4>
                <div className="space-y-2.5">{profs.map(p => <ProficiencyBar key={p.label} {...p} />)}</div>
              </div>
            );
          })()}

          {/* Favorites */}
          {(() => {
            const favs: string[] =
              ky.top_3_movies || ky.top_3_creators || ky.top_3_writers_books || [];
            const label =
              cohortType === 'FORGE' ? 'Favorite Films' :
              cohortType === 'FORGE_CREATORS' ? 'Favorite Creators' :
              'Favorite Writers/Books';
            if (!favs.length) return null;
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> {label}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {favs.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Writing types (writers only) */}
          {cohortType === 'FORGE_WRITING' && ky.writing_types?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Pen className="w-4 h-4 text-primary" /> Writing Types
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(ky.writing_types as string[]).map((t: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Creators: platform */}
          {cohortType === 'FORGE_CREATORS' && ky.primary_platform && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Primary Platform
              </h4>
              <Badge variant="secondary" className="text-xs">{ky.primary_platform}</Badge>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={!!member} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Batchmate Profile</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Batchmate Profile</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
