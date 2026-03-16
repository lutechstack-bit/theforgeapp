import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
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
          className="h-full rounded-full bg-[#FFBF00] transition-all duration-500"
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
  const { profile } = useAuth();

  // Get cohort type from the viewer's edition
  const { data: edition } = useQuery({
    queryKey: ['edition-type', profile?.edition_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('editions')
        .select('cohort_type')
        .eq('id', profile!.edition_id!)
        .single();
      return data;
    },
    enabled: !!profile?.edition_id,
    staleTime: Infinity,
  });

  const cohortType = edition?.cohort_type || 'FORGE';

  // Fetch KY data for the selected member
  const { data: kyData } = useQuery({
    queryKey: ['batchmate-ky', member?.id, cohortType],
    queryFn: async () => {
      const table =
        cohortType === 'FORGE' ? 'kyf_responses' :
        cohortType === 'FORGE_CREATORS' ? 'kyc_responses' :
        'kyw_responses';

      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', member!.id)
        .maybeSingle();
      return { ...data, _table: table };
    },
    enabled: !!member?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (!member) return null;

  const content = (
    <div className="space-y-5 pb-6 px-1">
      {/* Hero */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-[#FFBF00]/30">
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

      {kyData && kyData._table && (
        <>
          <Separator />

          {/* General Info */}
          {(() => {
            const occupation = (kyData as any).current_occupation || (kyData as any).current_status;
            const mbti = (kyData as any).mbti_type;
            const chronotype = (kyData as any).chronotype;
            const intent = (kyData as any).forge_intent;

            if (!occupation && !mbti && !chronotype && !intent) return null;

            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FFBF00]" /> About
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
                  {intent && intent !== 'other' && (
                    <Badge className="bg-[#FFBF00]/15 text-[#FFBF00] border-[#FFBF00]/30 text-xs">
                      <Star className="w-3 h-3 mr-1" /> {intent}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Proficiencies */}
          {(() => {
            if (cohortType === 'FORGE') {
              const d = kyData as any;
              const profs = [
                { label: 'Screenwriting', level: d.proficiency_screenwriting },
                { label: 'Direction', level: d.proficiency_direction },
                { label: 'Cinematography', level: d.proficiency_cinematography },
                { label: 'Editing', level: d.proficiency_editing },
              ].filter(p => p.level);
              if (!profs.length) return null;
              return (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#FFBF00]" /> Proficiencies
                  </h4>
                  <div className="space-y-2.5">{profs.map(p => <ProficiencyBar key={p.label} {...p} />)}</div>
                </div>
              );
            }
            if (cohortType === 'FORGE_CREATORS') {
              const d = kyData as any;
              const profs = [
                { label: 'Content Creation', level: d.proficiency_content_creation },
                { label: 'Storytelling', level: d.proficiency_storytelling },
                { label: 'Video Production', level: d.proficiency_video_production },
              ].filter(p => p.level);
              if (!profs.length) return null;
              return (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#FFBF00]" /> Proficiencies
                  </h4>
                  <div className="space-y-2.5">{profs.map(p => <ProficiencyBar key={p.label} {...p} />)}</div>
                </div>
              );
            }
            // FORGE_WRITING
            const d = kyData as any;
            const profs = [
              { label: 'Writing', level: d.proficiency_writing },
              { label: 'Story & Voice', level: d.proficiency_story_voice },
            ].filter(p => p.level);
            if (!profs.length) return null;
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Pen className="w-4 h-4 text-[#FFBF00]" /> Proficiencies
                </h4>
                <div className="space-y-2.5">{profs.map(p => <ProficiencyBar key={p.label} {...p} />)}</div>
              </div>
            );
          })()}

          {/* Favorites */}
          {(() => {
            const d = kyData as any;
            const favs: string[] =
              d.top_3_movies || d.top_3_creators || d.top_3_writers_books || [];
            const label =
              cohortType === 'FORGE' ? 'Favorite Films' :
              cohortType === 'FORGE_CREATORS' ? 'Favorite Creators' :
              'Favorite Writers/Books';
            if (!favs.length) return null;
            return (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#FFBF00]" /> {label}
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
          {cohortType === 'FORGE_WRITING' && (kyData as any).writing_types?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Pen className="w-4 h-4 text-[#FFBF00]" /> Writing Types
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {((kyData as any).writing_types as string[]).map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Creators: platform */}
          {cohortType === 'FORGE_CREATORS' && (kyData as any).primary_platform && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FFBF00]" /> Primary Platform
              </h4>
              <Badge variant="secondary" className="text-xs">{(kyData as any).primary_platform}</Badge>
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
