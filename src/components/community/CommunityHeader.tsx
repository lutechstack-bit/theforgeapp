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
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Forge Community</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {memberCount} members
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {onlineCount} online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
