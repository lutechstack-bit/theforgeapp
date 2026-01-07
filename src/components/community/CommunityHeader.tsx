import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityHeaderProps {
  memberCount: number;
  onlineCount: number;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  memberCount,
  onlineCount,
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Forge Community</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
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
