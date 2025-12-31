import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SecureVideoPlayer } from './SecureVideoPlayer';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface VideoResource {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size_mb?: number;
}

interface VideoContent {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  instructor_name?: string;
  company_name?: string;
  full_description?: string;
  duration_minutes?: number;
}

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: VideoContent | null;
  resources?: VideoResource[];
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  open,
  onOpenChange,
  content,
  resources = [],
}) => {
  if (!content) return null;

  const handleDownloadResource = async (resource: VideoResource) => {
    // Get signed URL for the resource
    const { data } = await supabase.storage
      .from('learn-resources')
      .createSignedUrl(resource.file_url, 300); // 5 minute expiry

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-background border border-border shadow-xl">
        <DialogHeader className="p-4 pb-2 bg-background border-b border-border">
          <DialogTitle className="text-lg font-bold truncate pr-8 text-foreground">
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row bg-background">
          {/* Video Player */}
          <div className="flex-1 bg-black min-h-0">
            <SecureVideoPlayer
              videoUrl={content.video_url}
              contentId={content.id}
              title={content.title}
              thumbnailUrl={content.thumbnail_url}
              className="aspect-video w-full"
            />
          </div>

          {/* Sidebar with description and resources */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/50">
            <ScrollArea className="h-full max-h-[40vh] lg:max-h-[70vh]">
              <div className="p-4 space-y-6">
                {/* Instructor Info */}
                {(content.instructor_name || content.company_name) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {content.instructor_name?.charAt(0) || 'I'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {content.instructor_name || 'Instructor'}
                      </p>
                      {content.company_name && (
                        <p className="text-xs text-muted-foreground">
                          {content.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration */}
                {content.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                      {content.duration_minutes} min
                    </span>
                  </div>
                )}

                {/* Description */}
                {content.full_description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm">
                      About this session
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {content.full_description}
                    </p>
                  </div>
                )}

                {/* Downloadable Resources */}
                {resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      Bonus Resources
                    </h4>
                    <div className="space-y-2">
                      {resources.map((resource) => (
                        <button
                          key={resource.id}
                          onClick={() => handleDownloadResource(resource)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            {getFileIcon(resource.file_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {resource.title}
                            </p>
                            {resource.file_size_mb && (
                              <p className="text-xs text-muted-foreground">
                                {resource.file_type.toUpperCase()} • {resource.file_size_mb} MB
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};