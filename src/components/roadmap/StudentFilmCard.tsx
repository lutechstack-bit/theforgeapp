import React from 'react';
import { Play, Clock, ExternalLink, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentFilmCardProps {
  film: {
    id: string;
    title: string;
    student_name: string;
    thumbnail_url?: string | null;
    video_url: string;
    duration_minutes?: number | null;
    description?: string | null;
    award_tags?: string[];
    is_featured?: boolean;
  };
}

const StudentFilmCard: React.FC<StudentFilmCardProps> = ({ film }) => {
  const handleClick = () => {
    window.open(film.video_url, '_blank', 'noopener,noreferrer');
  };

  const awards = Array.isArray(film.award_tags) ? film.award_tags : [];

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer flex-shrink-0 w-64 ${
        film.is_featured ? 'w-72' : ''
      }`}
    >
      {/* Poster */}
      <div className={`relative overflow-hidden rounded-xl aspect-[2/3] ${
        film.is_featured ? 'ring-2 ring-primary shadow-glow' : ''
      }`}>
        {film.thumbnail_url ? (
          <img
            src={film.thumbnail_url}
            alt={film.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary/50" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>

        {/* Awards */}
        {awards.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {awards.slice(0, 2).map((award, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] bg-black/70 text-white border-none">
                <Award className="w-2.5 h-2.5 mr-1" />
                {award}
              </Badge>
            ))}
          </div>
        )}

        {/* Duration */}
        {(film.duration_minutes ?? 0) > 0 && (
          <div className="absolute bottom-3 right-3">
            <span className="text-xs text-white bg-black/60 px-2 py-1 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {film.duration_minutes} min
            </span>
          </div>
        )}

        {/* External link indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {film.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">by {film.student_name}</p>
      </div>
    </div>
  );
};

export default StudentFilmCard;
