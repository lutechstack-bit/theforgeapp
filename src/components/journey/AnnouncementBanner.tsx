import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartAnnouncements } from '@/hooks/useSmartAnnouncements';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementBannerProps {
  className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ className }) => {
  const navigate = useNavigate();
  const { announcements, dismissAnnouncement } = useSmartAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through announcements
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length, isPaused]);

  // Reset index when announcements change
  useEffect(() => {
    if (currentIndex >= announcements.length) {
      setCurrentIndex(0);
    }
  }, [announcements.length, currentIndex]);

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];
  if (!currentAnnouncement) return null;

  const handleClick = () => {
    if (currentAnnouncement.deepLink) {
      navigate(currentAnnouncement.deepLink);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissAnnouncement(currentAnnouncement.id);
    
    // Move to next announcement or reset
    if (announcements.length > 1) {
      setCurrentIndex((prev) => prev % (announcements.length - 1));
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-primary/10 border border-primary/30',
        'backdrop-blur-sm',
        'cursor-pointer transition-all duration-200',
        'hover:bg-primary/15 hover:border-primary/40',
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Progress bar for auto-cycle */}
      {announcements.length > 1 && !isPaused && (
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-primary/50"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentIndex}
        />
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Navigation arrows */}
        {announcements.length > 1 && (
          <button
            onClick={handlePrev}
            className="p-1 rounded-full hover:bg-primary/20 transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAnnouncement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center gap-3 min-w-0"
          >
            {/* Icon */}
            <span className="text-lg shrink-0">{currentAnnouncement.icon}</span>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentAnnouncement.title}
              </p>
              {currentAnnouncement.message && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {currentAnnouncement.message}
                </p>
              )}
            </div>

            {/* Link indicator */}
            {currentAnnouncement.deepLink && (
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows (right) */}
        {announcements.length > 1 && (
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-primary/20 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-destructive/20 transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Pagination dots */}
      {announcements.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 10000);
              }}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                idx === currentIndex 
                  ? 'bg-primary w-3' 
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
              aria-label={`Go to announcement ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
