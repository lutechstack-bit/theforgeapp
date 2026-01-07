import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  image_url: string | null;
  is_announcement: boolean;
  sender_name: string;
  sender_avatar: string | null;
  reactions: Array<{
    emoji: string;
    count: number;
    hasReacted: boolean;
  }>;
}

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface WhatsAppChatProps {
  groups: CityGroup[];
  activeGroupId: string | null;
  onGroupChange: (groupId: string) => void;
  typingUsers: string[];
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  groups,
  activeGroupId,
  onGroupChange,
  typingUsers,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (activeGroupId) {
      fetchMessages();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [activeGroupId]);

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`chat-${activeGroupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `group_id=eq.${activeGroupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.user_id)
            .single();

          const messageWithSender: Message = {
            ...newMessage,
            sender_name: profile?.full_name || 'Unknown',
            sender_avatar: profile?.avatar_url,
            reactions: [],
          };

          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, messageWithSender];
          });
          
          scrollToBottom();
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    if (!activeGroupId) return;
    
    setLoading(true);
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select('*')
        .eq('group_id', activeGroupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Fetch profiles for all message senders
      const userIds = [...new Set(messagesData?.map((m) => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Fetch reactions
      const messageIds = messagesData?.map((m) => m.id) || [];
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      const messagesWithSenders: Message[] = (messagesData || []).map((msg) => {
        const profile = profileMap.get(msg.user_id);
        const msgReactions = reactions?.filter((r) => r.message_id === msg.id) || [];
        
        const reactionCounts = msgReactions.reduce((acc, r) => {
          if (!acc[r.emoji]) {
            acc[r.emoji] = { count: 0, hasReacted: false };
          }
          acc[r.emoji].count++;
          if (r.user_id === user?.id) {
            acc[r.emoji].hasReacted = true;
          }
          return acc;
        }, {} as Record<string, { count: number; hasReacted: boolean }>);

        return {
          ...msg,
          sender_name: profile?.full_name || 'Unknown',
          sender_avatar: profile?.avatar_url,
          reactions: Object.entries(reactionCounts).map(([emoji, data]) => ({
            emoji,
            ...data,
          })),
        };
      });

      setMessages(messagesWithSenders);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleSend = async (content: string, imageFile?: File) => {
    if (!user || !activeGroupId) return;

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('community-images')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('community_messages').insert({
      content,
      user_id: user.id,
      group_id: activeGroupId,
      image_url: imageUrl,
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;

    const existingReaction = messages
      .find((m) => m.id === messageId)
      ?.reactions.find((r) => r.emoji === emoji && r.hasReacted);

    if (existingReaction) {
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
    } else {
      await supabase.from('message_reactions').insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });
    }

    fetchMessages();
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card">
        <select
          value={activeGroupId || ''}
          onChange={(e) => onGroupChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-secondary/50 border-0 text-sm font-medium focus:ring-2 focus:ring-primary"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user_id === user?.id}
              onReact={(emoji) => handleReact(message.id, emoji)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-20 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} placeholder="Type a message..." />
    </div>
  );
};
