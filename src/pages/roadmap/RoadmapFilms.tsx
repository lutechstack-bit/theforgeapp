import React from 'react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import StudentFilmStrip from '@/components/roadmap/StudentFilmStrip';
import { Film } from 'lucide-react';

const RoadmapFilms: React.FC = () => {
  const { studentFilms } = useRoadmapData();

  if (!studentFilms || studentFilms.length === 0) {
    return (
      <div className="py-8">
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Films Yet</h2>
          <p className="text-muted-foreground">Student films from past editions will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <StudentFilmStrip 
        films={studentFilms.map(f => ({
          ...f,
          award_tags: Array.isArray(f.award_tags) ? f.award_tags as string[] : []
        }))} 
        title="Best Student Work" 
        subtitle="Top films from past Forge editions" 
      />
    </div>
  );
};

export default RoadmapFilms;
