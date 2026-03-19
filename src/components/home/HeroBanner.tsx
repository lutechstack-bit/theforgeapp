import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';

const FALLBACK_IMAGES = [
  '/images/levelup/01.jpg',
  '/images/levelup/02.jpg',
  '/images/levelup/03.jpg',
  '/images/levelup/04.jpg',
];

const SLIDE_INTERVAL = 5000;

interface HeroBannerProps {
  edition?: {
    name?: string;
    city?: string;
    forge_start_date?: string | null;
    forge_end_date?: string | null;
    cohort_type?: string;
  } | null;
  showCountdown?: boolean;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ edition, showCountdown }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { effectiveCohortType } = useEffectiveCohort();

  const { data: slides } = useQuery({
    queryKey: ['hero-slides', effectiveCohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_hero_slides')
        .select('*')
        .eq('cohort_type', effectiveCohortType || 'FORGE')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data?.map(s => s.image_url) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const images = slides && slides.length > 0 ? slides : FALLBACK_IMAGES;

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleScrollToJourney = useCallback(() => {
    const el = document.getElementById('journey-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh]">
      {/* Background images with crossfade */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Stronger dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

      {/* Overlaid content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 pb-6 sm:pb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 sm:mb-5">
          Welcome to{' '}
          <span className="hero-gradient-text">the Forge</span>
        </h2>

        <Button
          onClick={handleScrollToJourney}
          variant="outline"
          className="border-white/40 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm gap-2 px-6 py-2.5 rounded-full mb-4 sm:mb-5"
        >
          Start your Journey
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </Button>

        {showCountdown && (
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
            <CompactCountdownTimer edition={edition} variant="overlay" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
