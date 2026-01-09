import React from 'react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import MasonryGallery from '@/components/roadmap/MasonryGallery';
import { Image } from 'lucide-react';

const RoadmapGallery: React.FC = () => {
  const { stayGallery, momentsGallery } = useRoadmapData();

  if (stayGallery.length === 0 && momentsGallery.length === 0) {
    return (
      <div className="py-8">
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Gallery Yet</h2>
          <p className="text-muted-foreground">Photos from your Forge experience will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-8">
      {stayGallery.length > 0 && (
        <MasonryGallery
          images={stayGallery}
          title="Where You'll Create"
          subtitle="Your Forge home base"
        />
      )}
      
      {momentsGallery.length > 0 && (
        <MasonryGallery
          images={momentsGallery}
          title="Past Forge Magic"
          subtitle="Moments from previous editions"
        />
      )}
    </div>
  );
};

export default RoadmapGallery;
