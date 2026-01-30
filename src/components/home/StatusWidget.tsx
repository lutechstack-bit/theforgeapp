import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartAnnouncements } from '@/hooks/useSmartAnnouncements';
import { ClipboardList, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusWidgetProps {
  variant: 'desktop' | 'mobile';
  className?: string;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ variant, className }) => {
  const { profile, edition } = useAuth();
  const navigate = useNavigate();
  const { announcements, dismissAnnouncement } = useSmartAnnouncements();
  
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // Auto-cycle announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  const showKYForm = profile?.profile_setup_completed && !profile?.ky_form_completed;
  
  const getKYFormRoute = () => {
    switch (edition?.cohort_type) {
      case 'FORGE': return '/kyf-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      case 'FORGE_WRITING': return '/kyw-form';
      default: return '/kyf-form';
    }
  };
  
  const getKYFormLabel = () => {
    switch (edition?.cohort_type) {
      case 'FORGE': return 'Know Your Filmmaker';
      case 'FORGE_CREATORS': return 'Know Your Creator';
      case 'FORGE_WRITING': return 'Know Your Writer';
      default: return 'Complete KY Form';
    }
  };

  const currentAnnouncement = announcements[currentAnnouncementIndex];

  const handleAnnouncementClick = () => {
    if (currentAnnouncement?.deepLink) {
      if (currentAnnouncement.deepLink.startsWith('http')) {
        window.open(currentAnnouncement.deepLink, '_blank');
      } else {
        navigate(currentAnnouncement.deepLink);
      }
    }
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dismissAnnouncement(id);
  };

  // Don't render if nothing to show
  if (!showKYForm && announcements.length === 0) {
    return null;
  }

  // Desktop: Stacked card design
  if (variant === 'desktop') {
    return (
      <div className={cn("space-y-3", className)}>
        {/* KY Form Card */}
        {showKYForm && (
          <button
            onClick={() => navigate(getKYFormRoute())}
            className="w-full glass-card rounded-xl p-4 flex items-center gap-3 
                       border border-primary/30 bg-primary/10 
                       hover:bg-primary/20 transition-all duration-200 group text-left"
          >
            <div className="p-2 bg-primary/20 rounded-lg shrink-0">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{getKYFormLabel()}</p>
              <p className="text-xs text-muted-foreground">Required for full access</p>
            </div>
            <div className="relative shrink-0 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button>
        )}
        
        {/* Compact Announcements */}
        {currentAnnouncement && (
          <button
            onClick={handleAnnouncementClick}
            className="w-full glass-card rounded-xl p-3 flex items-center gap-3 
                       border border-border/50 bg-muted/30
                       hover:bg-muted/50 transition-all duration-200 group text-left relative"
          >
            <span className="text-lg shrink-0">{currentAnnouncement.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentAnnouncement.title}
              </p>
              {currentAnnouncement.message && (
                <p className="text-xs text-muted-foreground truncate">
                  {currentAnnouncement.message}
                </p>
              )}
            </div>
            
            {/* Announcement count indicator */}
            {announcements.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                {announcements.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      idx === currentAnnouncementIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Dismiss button */}
            <button
              onClick={(e) => handleDismiss(e, currentAnnouncement.id)}
              className="shrink-0 p-1 rounded-full hover:bg-background/50 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </button>
        )}
      </div>
    );
  }

  // Mobile: Horizontal compact design
  return (
    <div className={cn("flex gap-2", className)}>
      {showKYForm && (
        <button
          onClick={() => navigate(getKYFormRoute())}
          className="flex-1 glass-card rounded-xl px-3 py-2.5 flex items-center gap-2 
                     border border-primary/30 bg-primary/10 
                     hover:bg-primary/20 transition-all duration-200"
        >
          <ClipboardList className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            Complete KY Form
          </span>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </button>
      )}
      
      {currentAnnouncement && (
        <button
          onClick={handleAnnouncementClick}
          className={cn(
            "glass-card rounded-xl px-3 py-2.5 flex items-center gap-2",
            "border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all duration-200",
            showKYForm ? "flex-1" : "w-full"
          )}
        >
          <span className="text-sm shrink-0">{currentAnnouncement.icon}</span>
          <span className="text-sm truncate text-foreground">{currentAnnouncement.title}</span>
          
          {/* Dismiss */}
          <button
            onClick={(e) => handleDismiss(e, currentAnnouncement.id)}
            className="shrink-0 p-0.5 ml-auto"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </button>
      )}
    </div>
  );
};
