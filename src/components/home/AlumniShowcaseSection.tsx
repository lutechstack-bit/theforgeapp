import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { TestimonialVideoCard } from '@/components/shared/TestimonialVideoCard';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';

interface AlumniData {
  id: string;
  name: string;
  role?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  film?: string | null;
  achievement?: string | null;
}

interface AlumniShowcaseSectionProps {
  alumni: AlumniData[];
  isLoading: boolean;
  title?: string;
  subtitle?: string;
}

const AlumniShowcaseSection: React.FC<AlumniShowcaseSectionProps> = ({
  alumni,
  isLoading,
  title = 'Alumni Showcase',
  subtitle,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <HomeCarouselSkeleton title={title} />;
  }

  if (alumni.length === 0) return null;

  return (
    <ContentCarousel
      title={title}
      onSeeAll={() => navigate('/learn')}
    >
      {alumni.map((a) => (
        <TestimonialVideoCard
          key={a.id}
          name={a.name}
          role={a.role || undefined}
          videoUrl={a.video_url}
          thumbnailUrl={a.thumbnail_url || undefined}
          film={a.film || undefined}
          achievement={a.achievement || undefined}
        />
      ))}
    </ContentCarousel>
  );
};

export default AlumniShowcaseSection;
