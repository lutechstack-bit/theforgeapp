import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Loader2, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CohortType } from '@/contexts/ThemeContext';
import forgeLogoImg from '@/assets/forge-logo.png';
import forgeWritingLogoImg from '@/assets/forge-writing-logo.png';
import forgeCreatorsLogoImg from '@/assets/forge-creators-logo.png';

interface CohortPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortType: CohortType | null;
}

const cohortLogos: Record<CohortType, string> = {
  FORGE: forgeLogoImg,
  FORGE_WRITING: forgeWritingLogoImg,
  FORGE_CREATORS: forgeCreatorsLogoImg,
};

const cohortNames: Record<CohortType, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

const cohortDescriptions: Record<CohortType, string> = {
  FORGE: 'Master the art of filmmaking with hands-on experience',
  FORGE_WRITING: 'Craft compelling screenplays and stories',
  FORGE_CREATORS: 'Build your creator career and audience',
};

const CohortPreviewModal: React.FC<CohortPreviewModalProps> = ({ isOpen, onClose, cohortType }) => {
  // Fetch a sample edition for this cohort to show roadmap preview
  const { data: previewData, isLoading } = useQuery({
    queryKey: ['cohort-preview', cohortType],
    queryFn: async () => {
      if (!cohortType) return null;
      
      // Get an edition for this cohort type
      const { data: edition, error: editionError } = await supabase
        .from('editions')
        .select('id, name, city')
        .eq('cohort_type', cohortType)
        .limit(1)
        .maybeSingle();
      
      if (editionError || !edition) {
        // Return mock preview data if no edition exists
        return {
          edition: null,
          roadmapDays: Array.from({ length: 5 }, (_, i) => ({
            id: `preview-${i}`,
            day_number: i + 1,
            title: `Day ${i + 1}`,
            description: 'Unlock to discover what awaits...',
          })),
        };
      }

      // Get roadmap days for preview
      const { data: roadmapDays } = await supabase
        .from('roadmap_days')
        .select('id, day_number, title, description, activity_type')
        .eq('edition_id', edition.id)
        .order('day_number', { ascending: true })
        .limit(8);

      return {
        edition,
        roadmapDays: roadmapDays || [],
      };
    },
    enabled: isOpen && !!cohortType,
  });

  if (!cohortType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <img 
                src={cohortLogos[cohortType]} 
                alt={cohortNames[cohortType]}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{cohortNames[cohortType]}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {cohortDescriptions[cohortType]}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>
                  {previewData?.roadmapDays?.length || 0} days of immersive experience
                </span>
              </div>

              {previewData?.roadmapDays?.map((day, index) => (
                <div
                  key={day.id}
                  className="glass-card rounded-xl p-4"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {day.day_number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">
                          {day.title}
                        </p>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 border border-border/30">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Locked</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {day.description || 'Discover what this day has in store...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {(previewData?.roadmapDays?.length || 0) > 0 && (
                <div className="text-center py-3">
                  <p className="text-xs text-muted-foreground">
                    + more days to explore
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button 
            className="w-full gradient-primary text-primary-foreground"
            onClick={() => {
              // Could link to signup/info page for this cohort
              window.open('https://theforge.in', '_blank');
            }}
          >
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CohortPreviewModal;
