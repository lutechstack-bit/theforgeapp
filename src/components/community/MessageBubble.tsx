import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, CheckCheck, Megaphone } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  image_url: string | null;
  is_announcement: boolean;
  sender_name: string;
  sender_avatar: string | null;
  reactions: Reaction[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact: (emoji: string) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReact,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  // Announcement style
  if (message.is_announcement) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Megaphone className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={message.sender_avatar || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {getInitials(message.sender_name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-1 ml-1">
            {message.sender_name}
          </p>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <div
              className={cn(
                'relative px-4 py-2 rounded-2xl cursor-pointer transition-colors',
                isOwn
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border/50 rounded-bl-md'
              )}
            >
              {/* Message content */}
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Shared image"
                  className="max-w-full rounded-lg mb-2"
                />
              )}
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* Time and delivery status */}
              <div
                className={cn(
                  'flex items-center gap-1 mt-1',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                <span
                  className={cn(
                    'text-[10px]',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <CheckCheck
                    className={cn(
                      'w-3 h-3',
                      'text-primary-foreground/70'
                    )}
                  />
                )}
              </div>

              {/* Bubble tail */}
              <div
                className={cn(
                  'absolute bottom-0 w-3 h-3',
                  isOwn
                    ? 'right-0 translate-x-1/2 bg-primary'
                    : 'left-0 -translate-x-1/2 bg-card border-l border-b border-border/50',
                  'transform rotate-45'
                )}
                style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="w-auto p-2 flex gap-1"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="text-lg hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                  reaction.hasReacted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
