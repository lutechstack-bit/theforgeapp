import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCheck, Megaphone } from 'lucide-react';

interface Reaction { emoji: string; count: number; hasReacted: boolean; }
interface Message {
  id: string; content: string; user_id: string; created_at: string;
  image_url: string | null; is_announcement: boolean;
  sender_name: string; sender_avatar: string | null; reactions: Reaction[];
}
interface MessageBubbleProps { message: Message; isOwn: boolean; onReact: (emoji: string) => void; }

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onReact }) => {
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const formatTime = (dateString: string) => format(new Date(dateString), 'h:mm a');

  if (message.is_announcement) {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Megaphone className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={message.sender_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {getInitials(message.sender_name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[80%]', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">{message.sender_name}</p>}

        <Popover>
          <PopoverTrigger asChild>
            <div className={cn(
              'relative px-3 py-2 rounded-2xl cursor-pointer transition-colors text-sm',
              isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary/80 rounded-bl-md'
            )}>
              {message.image_url && <img src={message.image_url} alt="" className="max-w-full rounded-lg mb-1.5" />}
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
                <span className={cn('text-[10px]', isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                  {formatTime(message.created_at)}
                </span>
                {isOwn && <CheckCheck className="w-3 h-3 text-primary-foreground/60" />}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-auto p-1.5 flex gap-0.5">
            {REACTION_EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => onReact(emoji)} className="text-base hover:scale-125 transition-transform p-1">
                {emoji}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact(reaction.emoji)}
                className={cn(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors',
                  reaction.hasReacted ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
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
