import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecureVideoPlayerProps {
  videoUrl: string;
  contentId: string;
  title: string;
  thumbnailUrl?: string;
  onClose?: () => void;
  className?: string;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  contentId,
  title,
  thumbnailUrl,
  onClose,
  className,
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Log access when video starts
  useEffect(() => {
    if (user && contentId) {
      const logAccess = async () => {
        await supabase.from('video_access_logs').insert({
          user_id: user.id,
          learn_content_id: contentId,
          user_agent: navigator.userAgent,
        });
      };
      logAccess();
    }
  }, [user, contentId]);

  // Update watch time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && user && contentId) {
        setWatchTime((prev) => prev + 5);
        // Update the watch duration in the log
        supabase
          .from('video_access_logs')
          .update({ watch_duration_seconds: watchTime + 5 })
          .eq('user_id', user.id)
          .eq('learn_content_id', contentId)
          .order('accessed_at', { ascending: false })
          .limit(1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, user, contentId, watchTime]);

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  // Prevent keyboard shortcuts for downloading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+Shift+S, Ctrl+U
      if (
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-2xl overflow-hidden group select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element with DRM-like protections */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
        onClick={handlePlayPause}
      />

      {/* Watermark overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="text-white text-2xl font-bold transform rotate-[-30deg]">
          BFP FORGE
        </div>
      </div>

      {/* Custom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleRestart}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="h-4 w-4 text-white" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <span className="text-white/80 text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs hidden md:inline">
              {title}
            </span>
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4 text-white" />
              ) : (
                <Maximize className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)] hover:scale-110 transition-transform">
            <Play className="h-10 w-10 text-primary-foreground ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};