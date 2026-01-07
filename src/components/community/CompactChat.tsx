import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, Send, Image as ImageIcon, X } from 'lucide-react';
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
  reactions: Array<{ emoji: string; count: number; hasReacted: boolean; }>;
}

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface CompactChatProps {
  groups: CityGroup[];
  activeGroupId: string | null;
  onGroupChange: (groupId: string) => void;
  typingUsers: string[];
}

export const CompactChat: React.FC<CompactChatProps> = ({
  groups,
  activeGroupId,
  onGroupChange,
  typingUsers,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (activeGroupId) {
      fetchMessages();
      setupRealtimeSubscription();
    }
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [activeGroupId]);

  const setupRealtimeSubscription = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel(`chat-${activeGroupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `group_id=eq.${activeGroupId}` },
        async (payload) => {
          const newMsg = payload.new as any;
          const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newMsg.user_id).single();
          const messageWithSender: Message = { ...newMsg, sender_name: profile?.full_name || 'Unknown', sender_avatar: profile?.avatar_url, reactions: [] };
          setMessages((prev) => prev.some(m => m.id === newMsg.id) ? prev : [...prev, messageWithSender]);
          scrollToBottom();
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    if (!activeGroupId) return;
    setLoading(true);
    const { data: messagesData } = await supabase.from('community_messages').select('*').eq('group_id', activeGroupId).order('created_at', { ascending: true }).limit(100);
    const userIds = [...new Set(messagesData?.map((m) => m.user_id) || [])];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
    const messageIds = messagesData?.map((m) => m.id) || [];
    const { data: reactions } = await supabase.from('message_reactions').select('*').in('message_id', messageIds);
    const profileMap = new Map(profiles?.map((p) => [p.id, p]));
    const messagesWithSenders: Message[] = (messagesData || []).map((msg) => {
      const profile = profileMap.get(msg.user_id);
      const msgReactions = reactions?.filter((r) => r.message_id === msg.id) || [];
      const reactionCounts = msgReactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasReacted: false };
        acc[r.emoji].count++;
        if (r.user_id === user?.id) acc[r.emoji].hasReacted = true;
        return acc;
      }, {} as Record<string, { count: number; hasReacted: boolean }>);
      return { ...msg, sender_name: profile?.full_name || 'Unknown', sender_avatar: profile?.avatar_url, reactions: Object.entries(reactionCounts).map(([emoji, data]) => ({ emoji, ...data })) };
    });
    setMessages(messagesWithSenders);
    setLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || sending || !user || !activeGroupId) return;
    
    const messageContent = message.trim();
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;
    
    // Clear input immediately for better UX
    setMessage('');
    removeImage();
    setSending(true);
    
    // Create optimistic message
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      content: messageContent,
      user_id: user.id,
      created_at: new Date().toISOString(),
      image_url: currentImagePreview,
      is_announcement: false,
      sender_name: user.user_metadata?.full_name || 'You',
      sender_avatar: null,
      reactions: [],
    };
    
    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();
    
    let imageUrl: string | null = null;
    if (currentImageFile) {
      const fileName = `${user.id}-${Date.now()}.${currentImageFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('community-images').upload(fileName, currentImageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('community-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }
    
    const { error } = await supabase.from('community_messages').insert({ 
      content: messageContent, 
      user_id: user.id, 
      group_id: activeGroupId, 
      image_url: imageUrl 
    });
    
    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.error('Failed to send message:', error);
    }
    
    setSending(false);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = messages.find((m) => m.id === messageId)?.reactions.find((r) => r.emoji === emoji && r.hasReacted);
    if (existing) await supabase.from('message_reactions').delete().eq('message_id', messageId).eq('user_id', user.id).eq('emoji', emoji);
    else await supabase.from('message_reactions').insert({ message_id: messageId, user_id: user.id, emoji });
    fetchMessages();
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background/50">
        <select
          value={activeGroupId || ''}
          onChange={(e) => onGroupChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-foreground border-0 focus:ring-0 focus:outline-none cursor-pointer pr-6"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        {typingUsers.length > 0 && (
          <span className="text-xs text-muted-foreground animate-pulse">
            {typingUsers[0]} typing...
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.user_id === user?.id} onReact={(emoji) => handleReact(msg.id, emoji)} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button size="icon" variant="secondary" className="absolute bottom-20 right-4 rounded-full shadow-lg w-8 h-8" onClick={scrollToBottom}>
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-3 py-2 border-t border-border/30">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover" />
            <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Compact Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border/30 bg-background/50">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={sending} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Message ${activeGroup?.name || ''}...`}
          disabled={sending}
          className="flex-1 bg-secondary/50 rounded-full px-4 py-2 text-sm border-0 focus:ring-2 focus:ring-primary/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={(!message.trim() && !imageFile) || sending}
          className={cn(
            "p-2 rounded-full transition-all",
            (message.trim() || imageFile) && !sending ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};
