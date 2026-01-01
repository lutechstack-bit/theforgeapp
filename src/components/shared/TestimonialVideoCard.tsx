import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface TestimonialVideoCardProps {
  name: string;
  videoUrl: string;
  thumbnailUrl?: string;
  onClick?: () => void;
  className?: string;
}

export const TestimonialVideoCard: React.FC<TestimonialVideoCardProps> = ({
  name,
  videoUrl,
  thumbnailUrl,
  onClick,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative min-w-[220px] sm:min-w-[260px] md:min-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        muted={isMuted}
        playsInline
        loop={false}
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay - stronger when not playing */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        isPlaying 
          ? "bg-gradient-to-t from-background/60 via-transparent to-transparent" 
          : "bg-gradient-to-t from-background via-background/40 to-transparent"
      )} />

      {/* Play/Pause Button */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
        )}
      >
        <button
          onClick={handlePlayPause}
          className="w-14 h-14 rounded-full bg-foreground/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-background" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Mute Button - only visible when playing */}
      {isPlaying && (
        <button
          onClick={handleMuteToggle}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-foreground" />
          ) : (
            <Volume2 className="w-5 h-5 text-foreground" />
          )}
        </button>
      )}

      {/* Name Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <span className="text-sm sm:text-base font-semibold text-foreground">{name}</span>
      </div>
    </div>
  );
};
