import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentFilmCard from './StudentFilmCard';

interface Film {
  id: string;
  title: string;
  student_name: string;
  thumbnail_url?: string | null;
  video_url: string;
  duration_minutes?: number | null;
  description?: string | null;
  award_tags?: string[];
  is_featured?: boolean;
}

interface StudentFilmStripProps {
  films: Film[];
  title?: string;
  subtitle?: string;
}

const StudentFilmStrip: React.FC<StudentFilmStripProps> = ({
  films,
  title = "Student Films",
  subtitle = "Best work from past Forge editions"
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!films || films.length === 0) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-center py-12 glass-card rounded-xl">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No films to show yet</p>
        </div>
      </section>
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Sort to show featured first
  const sortedFilms = [...films].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Film Strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
      >
        {sortedFilms.map((film) => (
          <StudentFilmCard key={film.id} film={film} />
        ))}
      </div>
    </section>
  );
};

export default StudentFilmStrip;
