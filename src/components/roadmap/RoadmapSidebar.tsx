import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SidebarMomentsCarousel from './SidebarMomentsCarousel';
import SidebarStudentWorkCarousel from './SidebarStudentWorkCarousel';
import SidebarStayCarousel from './SidebarStayCarousel';

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

const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({ editionId }) => {
  const { data: sidebarContent } = useQuery({
    queryKey: ['roadmap-sidebar-content', editionId],
    queryFn: async () => {
      let query = supabase
        .from('roadmap_sidebar_content')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (editionId) {
        query = query.or(`edition_id.eq.${editionId},edition_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SidebarItem[];
    },
    enabled: true
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

  const stayItems = (sidebarContent || [])
    .filter(item => item.block_type === 'stay_locations')
    .map(item => ({
      id: item.id,
      media_url: item.media_url,
      title: item.title || undefined,
      caption: item.caption || undefined
    }));

  // Don't render if no content
  const hasContent = momentsItems.length > 0 || studentWorkItems.length > 0 || stayItems.length > 0;
  
  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Block 1: Past Cohort Moments */}
      {momentsItems.length > 0 && (
        <SidebarMomentsCarousel items={momentsItems} />
      )}

      {/* Block 2: Student Work */}
      {studentWorkItems.length > 0 && (
        <SidebarStudentWorkCarousel items={studentWorkItems} />
      )}

      {/* Block 3: Stay Locations */}
      {stayItems.length > 0 && (
        <SidebarStayCarousel items={stayItems} />
      )}
    </div>
  );
};

export default RoadmapSidebar;
