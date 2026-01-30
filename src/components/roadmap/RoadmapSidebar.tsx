import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SidebarMomentsCarousel from './SidebarMomentsCarousel';
import SidebarStudentWorkCarousel from './SidebarStudentWorkCarousel';
import SidebarStayCarousel from './SidebarStayCarousel';
import StayLocationDetailModal from './StayLocationDetailModal';
import { RoadmapHighlightsModal } from '@/components/home/RoadmapHighlightsModal';

interface RoadmapSidebarProps {
  editionId?: string;
}

interface SidebarItem {
  id: string;
  block_type: string;
  media_url: string;
  media_type: string;
  title: string | null;
  caption: string | null;
  order_index: number;
}

interface Contact {
  name: string;
  phone: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface StayLocation {
  id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  google_maps_url?: string;
  contacts?: Contact[];
  notes?: string[];
  gallery_images?: GalleryImage[];
  featured_image_url?: string;
}

type ModalType = 'moments' | 'studentWork' | null;

const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({ editionId }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStayLocation, setSelectedStayLocation] = useState<StayLocation | null>(null);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);

  // First, fetch content IDs linked to this edition via junction table
  const { data: linkedContentIds } = useQuery({
    queryKey: ['roadmap-sidebar-content-ids', editionId],
    queryFn: async () => {
      if (!editionId) return null;
      
      const { data, error } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id')
        .eq('edition_id', editionId);
      
      if (error) throw error;
      return data.map(item => item.content_id);
    },
    enabled: !!editionId
  });

  // Fetch all content IDs that have ANY edition mapping (to identify global content)
  const { data: allMappedContentIds } = useQuery({
    queryKey: ['all-mapped-content-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_sidebar_content_editions')
        .select('content_id');
      
      if (error) throw error;
      // Get unique content IDs that have mappings
      return [...new Set(data.map(item => item.content_id))];
    }
  });

  const { data: sidebarContent } = useQuery({
    queryKey: ['roadmap-sidebar-content', editionId, linkedContentIds, allMappedContentIds],
    queryFn: async () => {
      const { data: allContent, error } = await supabase
        .from('roadmap_sidebar_content')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      
      // Filter content based on edition
      const filteredContent = (allContent || []).filter(item => {
        // If no edition specified, show all content
        if (!editionId) return true;
        
        // Check if content has any edition mappings
        const hasMappings = allMappedContentIds?.includes(item.id);
        
        if (!hasMappings) {
          // No mappings = global content, show to everyone
          return true;
        }
        
        // Has mappings, check if this edition is included
        return linkedContentIds?.includes(item.id);
      });

      return filteredContent as SidebarItem[];
    },
    enabled: allMappedContentIds !== undefined
  });

  // Fetch stay location edition mappings for current edition
  const { data: stayLocationEditionIds } = useQuery({
    queryKey: ['stay-location-editions', editionId],
    queryFn: async () => {
      if (!editionId) return null;
      
      const { data, error } = await supabase
        .from('stay_location_editions')
        .select('stay_location_id')
        .eq('edition_id', editionId);
      
      if (error) throw error;
      return data.map(d => d.stay_location_id);
    },
    enabled: !!editionId
  });

  // Fetch all stay location IDs that have ANY edition mapping (to identify global ones)
  const { data: allMappedStayLocationIds } = useQuery({
    queryKey: ['all-mapped-stay-location-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stay_location_editions')
        .select('stay_location_id');
      
      if (error) throw error;
      return [...new Set(data.map(d => d.stay_location_id))];
    }
  });

  // Fetch stay locations from new table
  const { data: stayLocations = [] } = useQuery({
    queryKey: ['stay-locations', editionId, stayLocationEditionIds, allMappedStayLocationIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stay_locations')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Filter by edition - show edition-specific + global (no mappings)
      const filteredData = (data || []).filter(loc => {
        if (!editionId) return true;
        
        const hasMappings = allMappedStayLocationIds?.includes(loc.id);
        if (!hasMappings) return true; // Global - no mappings
        
        return stayLocationEditionIds?.includes(loc.id);
      });

      return filteredData.map(loc => ({
        ...loc,
        contacts: (loc.contacts as unknown as Contact[]) || [],
        notes: (loc.notes as unknown as string[]) || [],
        gallery_images: (loc.gallery_images as unknown as GalleryImage[]) || [],
      })) as StayLocation[];
    },
    enabled: allMappedStayLocationIds !== undefined
  });

  // Group content by block type
  const momentsItems = (sidebarContent || [])
    .filter(item => item.block_type === 'past_moments')
    .map(item => ({
      id: item.id,
      media_url: item.media_url,
      title: item.title || undefined,
      caption: item.caption || undefined
    }));

  const studentWorkItems = (sidebarContent || [])
    .filter(item => item.block_type === 'student_work')
    .map(item => ({
      id: item.id,
      media_url: item.media_url,
      media_type: item.media_type as 'youtube' | 'instagram' | 'image',
      title: item.title || undefined,
      caption: item.caption || undefined
    }));

  // Convert stay locations to carousel items
  const stayItems = stayLocations.map(loc => ({
    id: loc.id,
    media_url: loc.featured_image_url || '',
    title: loc.name,
    caption: loc.city || undefined
  }));

  const handleStayViewAll = () => {
    if (stayLocations.length > 0) {
      setSelectedStayLocation(stayLocations[0]);
      setIsStayModalOpen(true);
    }
  };

  // Don't render if no content
  const hasContent = momentsItems.length > 0 || studentWorkItems.length > 0 || stayItems.length > 0;
  
  if (!hasContent) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        {/* Block 1: Past Cohort Moments */}
        {momentsItems.length > 0 && (
          <SidebarMomentsCarousel 
            items={momentsItems} 
            onViewAll={() => setActiveModal('moments')}
          />
        )}

        {/* Block 2: Student Work */}
        {studentWorkItems.length > 0 && (
          <SidebarStudentWorkCarousel 
            items={studentWorkItems}
            onViewAll={() => setActiveModal('studentWork')}
          />
        )}

        {/* Block 3: Stay Locations (from new table) */}
        {stayItems.length > 0 && (
          <SidebarStayCarousel 
            items={stayItems}
            onViewAll={handleStayViewAll}
          />
        )}
      </div>

      {/* Modals */}
      <RoadmapHighlightsModal
        open={activeModal === 'moments'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        type="moments"
        items={momentsItems.map(item => ({
          id: item.id,
          media_url: item.media_url,
          title: item.title,
          caption: item.caption,
        }))}
      />
      
      <RoadmapHighlightsModal
        open={activeModal === 'studentWork'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        type="studentWork"
        items={studentWorkItems.map(item => ({
          id: item.id,
          media_url: item.media_url,
          media_type: item.media_type,
          title: item.title,
          caption: item.caption,
        }))}
      />
      
      {/* Stay Location Detail Modal */}
      <StayLocationDetailModal
        open={isStayModalOpen}
        onOpenChange={setIsStayModalOpen}
        location={selectedStayLocation}
      />
    </>
  );
};

export default RoadmapSidebar;
