import React from 'react';
import { Users } from 'lucide-react';

interface CommunityHeaderProps {
  memberCount: number;
  onlineCount: number;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  memberCount,
  onlineCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-border/50 p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forge Community</h1>
            <p className="text-sm text-muted-foreground">
              {memberCount} members
            </p>
          </div>
        </div>
        
        {/* Online indicator */}
        <div className="flex items-center gap-2 mt-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-sm text-muted-foreground">
            {onlineCount} online now
          </span>
        </div>
      </div>
    </div>
  );
};
