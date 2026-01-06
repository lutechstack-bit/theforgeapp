import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, Loader2, AlertCircle
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SecureVideoPlayerProps {
  videoUrl: string;
  contentId: string;
  title: string;
  thumbnailUrl?: string;
  videoSourceType?: 'upload' | 'embed';
  onClose?: () => void;
  onVideoEnd?: () => void;
  className?: string;
}

// Helper to extract Vimeo video ID and hash from various URL formats
const parseVimeoUrl = (input: string): { videoId: string; hash?: string } | null => {
  let url = input.trim();
  
  // Check if input is HTML embed code (contains iframe)
  if (url.includes('<iframe')) {
    // Extract src from iframe using regex
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      url = srcMatch[1];
      // Decode HTML entities (e.g., &amp; -> &)
      url = url.replace(/&amp;/g, '&');
    } else {
      return null;
    }
  }
  
  // Match patterns:
  // https://vimeo.com/123456789
  // https://player.vimeo.com/video/123456789
  // https://vimeo.com/123456789/abc123def (private with hash)
  // https://player.vimeo.com/video/123456789?h=abc123def
  const patterns = [
    /vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/,
    /player\.vimeo\.com\/video\/(\d+)(?:\?h=([a-zA-Z0-9]+))?/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { videoId: match[1], hash: match[2] };
    }
  }
  return null;
};

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  contentId,
  title,
  thumbnailUrl,
  videoSourceType = 'upload',
  onClose,
  onVideoEnd,
  className,
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const accessLogIdRef = useRef<string | null>(null);
  const watchTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Generate signed URL for private videos (skip for embed type)
  useEffect(() => {
    // For Vimeo embeds, we don't need to process the URL
    if (videoSourceType === 'embed') {
      setIsLoading(false);
      return;
    }

    const getSignedUrl = async () => {
      if (!videoUrl) {
        setError('No video URL provided');
        setIsLoading(false);
        return;
      }

      try {
        // If it's already a full URL (http/https), use it directly
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
          // If it's a Supabase storage URL for learn-videos, we need to re-sign it
          if (videoUrl.includes('learn-videos') && !videoUrl.includes('token=')) {
            const pathMatch = videoUrl.match(/learn-videos\/(.+)$/);
            if (pathMatch) {
              const { data, error: signError } = await supabase.storage
                .from('learn-videos')
                .createSignedUrl(pathMatch[1], 3600);
              
              if (data?.signedUrl) {
                setSignedUrl(data.signedUrl);
                setIsLoading(false);
                return;
              }
            }
          }
          setSignedUrl(videoUrl);
          setIsLoading(false);
          return;
        }

        // Otherwise, it's a storage path - get signed URL
        const { data, error: signError } = await supabase.storage
          .from('learn-videos')
          .createSignedUrl(videoUrl, 3600); // 1 hour expiry

        if (signError) {
          console.error('Error creating signed URL:', signError);
          setError('Failed to load video. Please try again.');
          setIsLoading(false);
          return;
        }

        setSignedUrl(data.signedUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error getting signed URL:', err);
        setError('Failed to load video');
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [videoUrl, videoSourceType]);

  // Log video access
  useEffect(() => {
    const logAccess = async () => {
      if (!user || !contentId) return;

      try {
        const { data, error } = await supabase
          .from('video_access_logs')
          .insert({
            user_id: user.id,
            learn_content_id: contentId,
            user_agent: navigator.userAgent,
          })
          .select('id')
          .single();

        if (!error && data) {
          accessLogIdRef.current = data.id;
        }
      } catch (err) {
        console.error('Failed to log video access:', err);
      }
    };

    logAccess();
  }, [user, contentId]);

  // Update watch duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (accessLogIdRef.current && watchTimeRef.current > 0) {
        supabase
          .from('video_access_logs')
          .update({ watch_duration_seconds: Math.floor(watchTimeRef.current) })
          .eq('id', accessLogIdRef.current)
          .then();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyM', 'KeyF'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          handlePlayPause();
          break;
        case 'ArrowLeft':
          handleSkipBackward();
          break;
        case 'ArrowRight':
          handleSkipForward();
          break;
        case 'ArrowUp':
          handleVolumeChange([Math.min(1, volume + 0.1)]);
          break;
        case 'ArrowDown':
          handleVolumeChange([Math.max(0, volume - 0.1)]);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleSkipForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  }, [currentTime, duration]);

  const handleSkipBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  }, [currentTime]);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleVideoError = () => {
    setError('Video format not supported. Please ensure the video is in MP4 (H.264) or WebM format.');
    setIsLoading(false);
  };

  // Loading state (for upload mode only)
  if (videoSourceType === 'upload' && isLoading && !signedUrl) {
    return (
      <div className={cn("relative bg-black rounded-2xl overflow-hidden flex items-center justify-center aspect-video", className)}>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <span className="text-white/70 text-sm">Loading video...</span>
        </div>
      </div>
    );
  }

  // Error state (for upload mode only)
  if (videoSourceType === 'upload' && (error || !signedUrl)) {
    return (
      <div className={cn("relative bg-black rounded-2xl overflow-hidden flex items-center justify-center aspect-video", className)}>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="text-center p-6 max-w-md relative z-10">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <div className="text-white text-lg font-medium mb-2">Unable to play video</div>
          <p className="text-white/60 text-sm">{error || 'Video not available or failed to load'}</p>
          <p className="text-white/40 text-xs mt-3">
            Tip: MP4 (H.264 video + AAC audio) works best across all devices.
          </p>
        </div>
      </div>
    );
  }

  // Vimeo Embed Mode
  if (videoSourceType === 'embed') {
    const vimeoData = parseVimeoUrl(videoUrl);
    
    if (!vimeoData) {
      return (
        <div className={cn("relative bg-black rounded-2xl overflow-hidden flex items-center justify-center aspect-video", className)}>
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="text-center p-6 max-w-md relative z-10">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <div className="text-white text-lg font-medium mb-2">Invalid Vimeo URL</div>
            <p className="text-white/60 text-sm">Could not parse the Vimeo video URL.</p>
          </div>
        </div>
      );
    }

    // Build Vimeo embed URL
    let embedUrl = `https://player.vimeo.com/video/${vimeoData.videoId}?autoplay=0&title=0&byline=0&portrait=0`;
    if (vimeoData.hash) {
      embedUrl += `&h=${vimeoData.hash}`;
    }

    return (
      <div className={cn("relative bg-black rounded-2xl overflow-hidden aspect-video", className)}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-2xl overflow-hidden select-none group aspect-video",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={signedUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-contain"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setIsLoading(false);
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          watchTimeRef.current = e.currentTarget.currentTime;
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onVideoEnd?.();
        }}
        onError={handleVideoError}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onClick={handlePlayPause}
      />

      {/* Loading Overlay */}
      {isLoading && signedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay Button */}
      {!isPlaying && !isLoading && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)] transform hover:scale-105 transition-transform">
            <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Title Overlay */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
      </div>

      {/* Custom Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&>span:first-child_>span]:bg-primary"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button 
              onClick={handlePlayPause}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 text-white" fill="currentColor" />
              )}
            </button>

            {/* Skip Backward */}
            <button 
              onClick={handleSkipBackward}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Rewind 10s (←)"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            {/* Skip Forward */}
            <button 
              onClick={handleSkipForward}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Forward 10s (→)"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button 
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_>span]:bg-white"
                />
              </div>
            </div>

            {/* Time Display */}
            <span className="text-white text-sm font-medium ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="px-2 py-1 hover:bg-white/20 rounded transition-colors text-white text-sm font-medium flex items-center gap-1"
                  title="Playback Speed"
                >
                  <Settings className="w-4 h-4" />
                  {playbackSpeed}x
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur">
                {playbackSpeeds.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handlePlaybackSpeedChange(speed)}
                    className={playbackSpeed === speed ? 'bg-primary/20' : ''}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureVideoPlayer;
