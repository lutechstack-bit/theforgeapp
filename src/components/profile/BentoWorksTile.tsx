import React from 'react';
import { BentoTile } from './BentoTile';
import { Plus } from 'lucide-react';
import { UserWork } from '@/hooks/useUserWorks';

interface BentoWorksTileProps {
  works: UserWork[];
  isOwner: boolean;
  onAddWork: () => void;
  onEditWork: (work: UserWork) => void;
  onDeleteWork: (workId: string) => void;
}

export const BentoWorksTile: React.FC<BentoWorksTileProps> = ({
  works,
  isOwner,
  onAddWork,
  onEditWork,
  onDeleteWork,
}) => {
  return (
    <BentoTile
      label="Works & Projects"
      icon="◈"
      className="col-span-full md:col-span-8 row-span-3"
      onEdit={isOwner ? onAddWork : undefined}
      animationDelay={0.28}
    >
      {works.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {works.map((work) => (
            <div
              key={work.id}
              className="flex-shrink-0 w-56 p-3 rounded-lg border border-primary/10 bg-secondary/30 hover:border-primary/25 transition-colors cursor-pointer group"
              onClick={() => isOwner && onEditWork(work)}
            >
              <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider mb-1">
                {work.type || 'Project'}
              </div>
              <div className="text-sm font-medium text-foreground mb-1 truncate">{work.title}</div>
              {work.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">{work.description}</div>
              )}
            </div>
          ))}

          {isOwner && (
            <button
              onClick={onAddWork}
              className="flex-shrink-0 w-16 flex items-center justify-center rounded-lg border border-dashed border-primary/20 hover:border-primary text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <button
            onClick={onAddWork}
            className="w-11 h-11 rounded-full border-[1.5px] border-dashed border-primary/25 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <Plus className="h-5 w-5" />
          </button>
          <span className="text-xs text-muted-foreground">Add your first work</span>
        </div>
      )}
    </BentoTile>
  );
};
