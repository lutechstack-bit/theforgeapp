import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  city?: string | null;
  specialty?: string | null;
  isOnline: boolean;
  onClick?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  fullName,
  avatarUrl,
  city,
  specialty,
  isOnline,
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all duration-200 min-w-[100px]"
    >
      <div className="relative">
        <Avatar className="w-14 h-14 border-2 border-background">
          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
            {getInitials(fullName || 'U')}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator */}
        <span
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-muted"
          )}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground truncate max-w-[90px]">
          {fullName || 'Member'}
        </p>
        {city && (
          <p className="text-xs text-muted-foreground truncate max-w-[90px]">
            {city}
          </p>
        )}
        {specialty && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
            {specialty}
          </span>
        )}
      </div>
    </button>
  );
};
