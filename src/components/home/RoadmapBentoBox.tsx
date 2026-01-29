import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Film,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { RoadmapHighlightsModal } from './RoadmapHighlightsModal';

type ModalType = 'moments' | 'studentWork' | 'stayLocation' | null;

export const RoadmapBentoBox: React.FC = () => {
  const { profile } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Fetch sidebar content for modals
  const { data: sidebarContent } = useQuery({
    queryKey: ['home-sidebar-content', profile?.edition_id],
    queryFn: async () => {
      // Fetch content linked to user's edition
      const { data: editionContentIds } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id')
        .eq('edition_id', profile?.edition_id || '');

      const linkedIds = editionContentIds?.map(e => e.content_id) || [];

      // Fetch all active sidebar content
      const { data: content } = await supabase
        .from('roadmap_sidebar_content')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      // Filter to show edition-specific + global (no edition links)
      const { data: allMappings } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id');
      
      const mappedIds = new Set(allMappings?.map(m => m.content_id) || []);
      
      return content?.filter(item => 
        linkedIds.includes(item.id) || !mappedIds.has(item.id)
      ) || [];
    },
    enabled: !!profile?.edition_id
  });

  // Group content by type
  const momentsItems = sidebarContent?.filter(item => item.block_type === 'past_moments') || [];
  const studentWorkItems = sidebarContent?.filter(item => item.block_type === 'student_work') || [];
  const stayItems = sidebarContent?.filter(item => item.block_type === 'stay_locations') || [];

  const BentoCard = ({ 
    children, 
    className = '', 
    onClick 
  }: { 
    children: React.ReactNode; 
    className?: string; 
    onClick?: () => void 
  }) => (
    <div 
      onClick={onClick}
      className={`
        bg-card border border-border rounded-2xl p-4 sm:p-5
        hover:border-primary/50 hover-gold-glow tap-scale cursor-pointer
        transition-all duration-300 group
        ${className}
      `}
    >
      {children}
    </div>
  );

  // Don't render if no content - removed stayItems from condition
  const hasContent = momentsItems.length > 0 || studentWorkItems.length > 0;
  
  if (!hasContent) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground px-1">Forge Highlights</h2>
        
        {/* Bento Grid Layout - 3 cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Past Moments - Opens Modal */}
          {momentsItems.length > 0 && (
            <BentoCard 
              className="col-span-1"
              onClick={() => setActiveModal('moments')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Past Moments</p>
                  <p className="text-xs text-muted-foreground">{momentsItems.length} photos</p>
                </div>
              </div>
            </BentoCard>
          )}

          {/* Student Work - Opens Modal */}
          {studentWorkItems.length > 0 && (
            <BentoCard 
              className="col-span-1"
              onClick={() => setActiveModal('studentWork')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Film className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Student Films</p>
                  <p className="text-xs text-muted-foreground">{studentWorkItems.length} videos</p>
                </div>
              </div>
            </BentoCard>
          )}


        </div>
      </div>

      {/* Modals */}
      <RoadmapHighlightsModal
        open={activeModal === 'moments'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        type="moments"
        items={momentsItems.map(item => ({
          id: item.id,
          media_url: item.media_url,
          media_type: item.media_type || undefined,
          title: item.title || undefined,
          caption: item.caption || undefined,
        }))}
      />
      
      <RoadmapHighlightsModal
        open={activeModal === 'studentWork'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        type="studentWork"
        items={studentWorkItems.map(item => ({
          id: item.id,
          media_url: item.media_url,
          media_type: item.media_type || undefined,
          title: item.title || undefined,
          caption: item.caption || undefined,
        }))}
      />
      
      <RoadmapHighlightsModal
        open={activeModal === 'stayLocation'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        type="stayLocation"
        items={stayItems.map(item => ({
          id: item.id,
          media_url: item.media_url,
          media_type: item.media_type || undefined,
          title: item.title || undefined,
          caption: item.caption || undefined,
        }))}
      />
    </>
  );
};
