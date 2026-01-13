import React from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Play, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const WorkCard: React.FC<{
  work: UserWork;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ work, isOwner, onEdit, onDelete }) => {
  const handleClick = () => {
    if (work.media_url) {
      window.open(work.media_url, '_blank');
    }
  };

  return (
    <div 
      className="group relative rounded-xl overflow-hidden border border-border/30 bg-secondary/20 hover:border-primary/30 transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-secondary/50 relative">
        {work.thumbnail_url ? (
          <img
            src={work.thumbnail_url}
            alt={work.title}
            className="w-full h-full object-cover"
          />
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
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
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

export const WorksSection: React.FC<WorksSectionProps> = ({
  works,
  isOwner = false,
  onAddWork,
  onEditWork,
  onDeleteWork,
}) => {
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
    </div>
  );
};
