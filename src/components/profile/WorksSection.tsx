import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Play, ExternalLink, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { UserWork } from '@/hooks/useUserWorks';

interface WorksSectionProps {
  works: UserWork[];
  isOwner?: boolean;
  onAddWork?: () => void;
  onEditWork?: (work: UserWork) => void;
  onDeleteWork?: (workId: string) => void;
}

const workTypeLabels: Record<string, string> = {
  short_film: 'Short Film',
  assignment: 'Assignment',
  personal: 'Personal Project',
  showcase: 'Showcase',
  other: 'Other',
};

const mediaTypeIcons: Record<string, React.ReactNode> = {
  video: <Play className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  pdf: <FileText className="h-3 w-3" />,
  link: <ExternalLink className="h-3 w-3" />,
};

// Helper to extract YouTube video ID and create embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
  }
  return null;
};

// Helper to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return null;
};

const WorkCard: React.FC<{
  work: UserWork;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPlay?: () => void;
}> = ({ work, isOwner, onEdit, onDelete, onPlay }) => {
  const youtubeEmbed = getYouTubeEmbedUrl(work.media_url || '');
  const youtubeThumbnail = getYouTubeThumbnail(work.media_url || '');
  const isYouTube = !!youtubeEmbed;
  
  const handleClick = () => {
    if (isYouTube) {
      onPlay?.();
    } else if (work.media_url) {
      window.open(work.media_url, '_blank');
    }
  };

  const displayThumbnail = work.thumbnail_url || youtubeThumbnail;

  return (
    <div 
      className="group relative rounded-xl overflow-hidden border border-border/30 bg-secondary/20 hover:border-primary/30 transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-secondary/50 relative">
        {displayThumbnail ? (
          <>
            <img
              src={displayThumbnail}
              alt={work.title}
              className="w-full h-full object-cover"
            />
            {isYouTube && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-white ml-1" fill="white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {work.media_type === 'video' && <Play className="h-12 w-12 text-muted-foreground/30" />}
            {work.media_type === 'image' && <ImageIcon className="h-12 w-12 text-muted-foreground/30" />}
            {work.media_type === 'pdf' && <FileText className="h-12 w-12 text-muted-foreground/30" />}
            {work.media_type === 'link' && <ExternalLink className="h-12 w-12 text-muted-foreground/30" />}
          </div>
        )}

        {/* Type Badge */}
        <Badge 
          variant="outline" 
          className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs"
        >
          {mediaTypeIcons[work.media_type]}
          <span className="ml-1">{workTypeLabels[work.type] || work.type}</span>
        </Badge>

        {/* Actions Menu */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{work.title}</h3>
        {work.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{work.description}</p>
        )}
        
        {/* Award Tags */}
        {work.award_tags && work.award_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {work.award_tags.map((tag, idx) => (
              <Badge key={idx} className="bg-primary/10 text-primary text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Video Player Modal for embedded playback
const VideoPlayerModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedUrl: string;
  title: string;
}> = ({ open, onOpenChange, embedUrl, title }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-none">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WorksSection: React.FC<WorksSectionProps> = ({
  works,
  isOwner = false,
  onAddWork,
  onEditWork,
  onDeleteWork,
}) => {
  const [videoModal, setVideoModal] = useState<{ open: boolean; embedUrl: string; title: string }>({
    open: false,
    embedUrl: '',
    title: '',
  });

  const handlePlayVideo = (work: UserWork) => {
    const embedUrl = getYouTubeEmbedUrl(work.media_url || '');
    if (embedUrl) {
      setVideoModal({ open: true, embedUrl, title: work.title });
    }
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Works & Projects</h2>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={onAddWork}>
            <Plus className="h-4 w-4 mr-1" />
            Add Work
          </Button>
        )}
      </div>

      {works.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              isOwner={isOwner}
              onEdit={() => onEditWork?.(work)}
              onDelete={() => onDeleteWork?.(work.id)}
              onPlay={() => handlePlayVideo(work)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border/50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">
            {isOwner 
              ? 'Add your first creative project' 
              : 'No projects yet'}
          </p>
          {isOwner && (
            <Button variant="outline" onClick={onAddWork}>
              <Plus className="h-4 w-4 mr-1" />
              Add Work
            </Button>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={videoModal.open}
        onOpenChange={(open) => setVideoModal({ ...videoModal, open })}
        embedUrl={videoModal.embedUrl}
        title={videoModal.title}
      />
    </div>
  );
};
