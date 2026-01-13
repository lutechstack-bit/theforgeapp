import React from 'react';
import { Users, Sparkles } from 'lucide-react';

interface CommunityHeaderProps {
  memberCount: number;
  onlineCount: number;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  memberCount,
  onlineCount,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">Forge Community</h1>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {onlineCount} online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
