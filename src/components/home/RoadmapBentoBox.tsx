import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Map, 
  CheckSquare, 
  Camera, 
  BookOpen, 
  Image, 
  Film,
  ArrowRight,
  Flame,
  MapPin,
  Sparkles
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { RoadmapHighlightsModal } from './RoadmapHighlightsModal';

type ModalType = 'moments' | 'studentWork' | 'stayLocation' | null;

export const RoadmapBentoBox: React.FC = () => {
  const navigate = useNavigate();
  const { profile, edition } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Fetch prep checklist progress
  const { data: prepData } = useQuery({
    queryKey: ['home-prep-progress', profile?.id, profile?.edition_id],
    queryFn: async () => {
      if (!profile?.id || !profile?.edition_id) return { total: 0, completed: 0 };
      
      // Get total items for the edition
      const { data: items } = await supabase
        .from('prep_checklist_items')
        .select('id')
        .eq('edition_id', profile.edition_id);
      
      // Get completed items
      const { data: progress } = await supabase
        .from('user_prep_progress')
        .select('id')
        .eq('user_id', profile.id);
      
      return {
        total: items?.length || 0,
        completed: progress?.length || 0
      };
    },
    enabled: !!profile?.id
  });

  // Fetch roadmap days count
  const { data: roadmapDays } = useQuery({
    queryKey: ['home-roadmap-days'],
    queryFn: async () => {
      const { data } = await supabase
        .from('roadmap_days')
        .select('id')
        .is('edition_id', null);
      return data?.length || 0;
    }
  });

  // Fetch featured equipment
  const { data: equipment } = useQuery({
    queryKey: ['home-featured-equipment', edition?.cohort_type],
    queryFn: async () => {
      const { data } = await supabase
        .from('forge_equipment')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .eq('cohort_type', edition?.cohort_type || 'FORGE')
        .limit(1);
      return data?.[0] || null;
    },
    enabled: !!edition?.cohort_type
  });

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

  // Calculate days until forge starts
  const daysUntilForge = edition?.forge_start_date 
    ? differenceInDays(new Date(edition.forge_start_date), new Date())
    : null;

  const forgeStarted = daysUntilForge !== null && daysUntilForge <= 0;

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

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground px-1">Your Roadmap</h2>
        
        {/* Bento Grid Layout - 8 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Journey Overview - Large card spanning 2 cols on all breakpoints */}
          <BentoCard 
            className="col-span-2 row-span-2 min-h-[180px] sm:min-h-[220px]"
            onClick={() => navigate('/roadmap/journey')}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Journey
                  </span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {roadmapDays || 14}-Day Forge
                </h3>
                
                {daysUntilForge !== null && (
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {forgeStarted 
                        ? 'Currently in progress' 
                        : `Starts in ${daysUntilForge} days`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                <span>Explore Journey</span>
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </BentoCard>

          {/* Prep Checklist - Medium card */}
          <BentoCard 
            className="col-span-1 min-h-[100px]"
            onClick={() => navigate('/roadmap/prep')}
          >
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Prep List</span>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {prepData?.completed || 0}
                  <span className="text-base text-muted-foreground font-normal">/{prepData?.total || 0}</span>
                </p>
                <p className="text-xs text-muted-foreground">Items ready</p>
              </div>
            </div>
          </BentoCard>

          {/* Equipment - Medium card */}
          <BentoCard 
            className="col-span-1 min-h-[100px]"
            onClick={() => navigate('/roadmap/equipment')}
          >
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Camera className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Equipment</span>
              </div>
              
              {equipment ? (
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {equipment.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">View arsenal</p>
              )}
            </div>
          </BentoCard>

          {/* Rules - Small card */}
          <BentoCard 
            className="col-span-1"
            onClick={() => navigate('/roadmap/rules')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Rules</p>
                <p className="text-xs text-muted-foreground">Guidelines</p>
              </div>
            </div>
          </BentoCard>

          {/* Gallery - Small card */}
          <BentoCard 
            className="col-span-1"
            onClick={() => navigate('/roadmap/gallery')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Image className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Gallery</p>
                <p className="text-xs text-muted-foreground">Moments</p>
              </div>
            </div>
          </BentoCard>

          {/* Past Moments - Opens Modal */}
          <BentoCard 
            className="col-span-1"
            onClick={() => setActiveModal('moments')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Moments</p>
                <p className="text-xs text-muted-foreground">{momentsItems.length} photos</p>
              </div>
            </div>
          </BentoCard>

          {/* Student Work - Opens Modal */}
          <BentoCard 
            className="col-span-1"
            onClick={() => setActiveModal('studentWork')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Film className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Films</p>
                <p className="text-xs text-muted-foreground">{studentWorkItems.length} videos</p>
              </div>
            </div>
          </BentoCard>

          {/* Stay Location - Opens Modal */}
          <BentoCard 
            className="col-span-2 lg:col-span-2"
            onClick={() => setActiveModal('stayLocation')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Where You'll Stay</p>
                <p className="text-xs text-muted-foreground">{stayItems.length} locations • Tap to explore</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </BentoCard>

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
