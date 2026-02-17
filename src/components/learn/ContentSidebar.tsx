import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CheckCircle2, Play, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SiblingItem {
  id: string;
  title: string;
  duration_minutes?: number | null;
  video_url?: string | null;
  order_index: number;
}

interface ProgressItem {
  learn_content_id: string;
  completed: boolean;
}

interface ContentSidebarProps {
  items: SiblingItem[];
  activeId: string;
  categoryName: string;
  progress: ProgressItem[];
  className?: string;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  items,
  activeId,
  categoryName,
  progress,
  className,
}) => {
  const navigate = useNavigate();

  const completedCount = progress.filter(p => p.completed).length;
  const progressMap = new Map(progress.map(p => [p.learn_content_id, p.completed]));

  return (
    <div className={cn("bg-card border border-border/50 rounded-xl overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide truncate">
          {categoryName}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {completedCount} of {items.length} completed
        </p>
      </div>

      {/* Lesson List */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {items.map((item, idx) => {
            const isActive = item.id === activeId;
            const isCompleted = progressMap.get(item.id) ?? false;
            const hasVideo = !!item.video_url;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isActive) navigate(`/learn/${item.id}`);
                }}
                className={cn(
                  "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-secondary/50 border-l-2 border-transparent"
                )}
              >
                {/* Number / Check */}
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <span className={cn(
                      "text-[11px] font-bold tabular-nums w-4 text-center block",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium leading-snug line-clamp-2",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {hasVideo ? (
                      <Play className="h-2.5 w-2.5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                    {(item.duration_minutes ?? 0) > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Playing indicator */}
                {isActive && !isCompleted && (
                  <div className="shrink-0 mt-1">
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <div className="w-0.5 h-3 bg-primary rounded-full animate-pulse delay-75" />
                      <div className="w-0.5 h-2 bg-primary rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
