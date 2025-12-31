import React, { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Megaphone, Smile, Image as ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface ChatBubbleProps {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  isOwn: boolean;
  isAnnouncement: boolean;
  senderName: string;
  senderAvatar?: string | null;
  senderSpecialty?: string | null;
  reactions: Reaction[];
  onReact: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '🔥', '👏'];

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  id,
  content,
  imageUrl,
  createdAt,
  isOwn,
  isAnnouncement,
  senderName,
  senderAvatar,
  senderSpecialty,
  reactions,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isAnnouncement) {
    return (
      <div className="mx-auto max-w-[85%] my-4">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Megaphone className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Announcement</span>
          </div>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Announcement" 
              className="w-full rounded-xl mb-3 object-cover max-h-48"
            />
          )}
          <p className="text-sm text-foreground font-medium">{content}</p>
          <span className="text-xs text-muted-foreground mt-2 block">
            {format(new Date(createdAt), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 group", isOwn ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-background",
        isOwn ? "bg-primary" : "bg-secondary"
      )}>
        {senderAvatar ? (
          <img 
            src={senderAvatar} 
            alt={senderName} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className={cn(
            "text-xs font-semibold",
            isOwn ? "text-primary-foreground" : "text-foreground"
          )}>
            {getInitials(senderName)}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div className={cn("max-w-[75%] relative", isOwn ? "items-end" : "items-start")}>
        {/* Sender Name */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-semibold text-foreground">{senderName}</span>
            {senderSpecialty && (
              <span className="text-xs text-muted-foreground">· {senderSpecialty}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={cn(
          "relative p-3 rounded-2xl shadow-sm",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-card border border-border/50 text-foreground rounded-bl-md"
        )}>
          {/* Image */}
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Shared" 
              className="rounded-xl mb-2 max-w-full max-h-64 object-cover"
            />
          )}
          
          {/* Text */}
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>

          {/* Reaction Button (appears on hover) */}
          <Popover open={showReactions} onOpenChange={setShowReactions}>
            <PopoverTrigger asChild>
              <button 
                className={cn(
                  "absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  "w-6 h-6 rounded-full bg-card border border-border shadow-md",
                  "flex items-center justify-center hover:scale-110",
                  isOwn ? "-left-3" : "-right-3"
                )}
              >
                <Smile className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(id, emoji);
                      setShowReactions(false);
                    }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className={cn("flex gap-1 mt-1 flex-wrap", isOwn ? "justify-end" : "justify-start")}>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(id, reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                  "border transition-colors",
                  reaction.hasReacted 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-card border-border/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-muted-foreground mt-1 px-1",
          isOwn ? "text-right block" : "block"
        )}>
          {format(new Date(createdAt), 'h:mm a')}
        </span>
      </div>
    </div>
  );
};
