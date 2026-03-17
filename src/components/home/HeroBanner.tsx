import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const FALLBACK_IMAGES = [
  '/images/levelup/01.jpg',
  '/images/levelup/02.jpg',
  '/images/levelup/03.jpg',
  '/images/levelup/04.jpg',
];

const SLIDE_INTERVAL = 5000;

const HeroBanner: React.FC = () => {
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
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '2.4/1' }}>
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

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Welcome to{' '}
          <span className="hero-gradient-text">the Forge</span>
        </h2>

        <Button
          onClick={handleScrollToJourney}
          variant="outline"
          className="mt-2 border-amber-400/60 text-white hover:bg-amber-500/20 hover:text-white backdrop-blur-sm gap-2"
        >
          Start your Journey
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </Button>
      </div>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
