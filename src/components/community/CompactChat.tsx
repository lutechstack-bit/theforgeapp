import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, Send, Image as ImageIcon, X, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';

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

interface CohortGroup {
  id: string;
  edition_id: string;
  name: string;
}

interface CompactChatProps {
  groups: CityGroup[];
  cohortGroup: CohortGroup | null;
  activeGroupType: 'cohort' | 'city';
  activeGroupId: string | null;
  onGroupChange: (groupId: string) => void;
  onCohortSelect: () => void;
  typingUsers: string[];
}

export const CompactChat: React.FC<CompactChatProps> = ({
  groups,
  cohortGroup,
  activeGroupType,
  activeGroupId,
  onGroupChange,
  onCohortSelect,
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
  }, [activeGroupId, activeGroupType]);

  const setupRealtimeSubscription = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel(`chat-${activeGroupType}-${activeGroupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Check if message is relevant to current view
          const isRelevant = activeGroupType === 'cohort' 
            ? newMsg.cohort_group_id === activeGroupId 
            : newMsg.group_id === activeGroupId && !newMsg.cohort_group_id;
          
          if (!isRelevant) return;
          
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
    
    let query = supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (activeGroupType === 'cohort') {
      query = query.eq('cohort_group_id', activeGroupId);
    } else {
      query = query.eq('group_id', activeGroupId).is('cohort_group_id', null);
    }
    
    const { data: messagesData } = await query;
    
    const userIds = [...new Set(messagesData?.map((m) => m.user_id) || [])];
    const { data: profiles } = userIds.length > 0 
      ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
      : { data: [] };
    const messageIds = messagesData?.map((m) => m.id) || [];
    const { data: reactions } = messageIds.length > 0 
      ? await supabase.from('message_reactions').select('*').in('message_id', messageIds)
      : { data: [] };
    
    const profileMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
    profiles?.forEach((p) => profileMap.set(p.id, p));
    
    const messagesWithSenders: Message[] = (messagesData || []).map((msg) => {
      const profile = profileMap.get(msg.user_id);
      const msgReactions = reactions?.filter((r) => r.message_id === msg.id) || [];
      const reactionCounts = msgReactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasReacted: false };
        acc[r.emoji].count++;
        if (r.user_id === user?.id) acc[r.emoji].hasReacted = true;
        return acc;
      }, {} as Record<string, { count: number; hasReacted: boolean }>);
      return { 
        id: msg.id,
        content: msg.content,
        user_id: msg.user_id,
        created_at: msg.created_at,
        image_url: msg.image_url,
        is_announcement: msg.is_announcement,
        sender_name: profile?.full_name || 'Unknown', 
        sender_avatar: profile?.avatar_url || null, 
        reactions: Object.entries(reactionCounts).map(([emoji, data]) => ({ emoji, count: data.count, hasReacted: data.hasReacted })) 
      };
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
    
    // Prepare insert data based on group type
    const insertData: any = {
      content: messageContent || (imageUrl ? '📷 Image' : ''),
      user_id: user.id,
      image_url: imageUrl,
    };

    if (activeGroupType === 'cohort') {
      insertData.cohort_group_id = activeGroupId;
      // Need a group_id for the FK, use first city group as fallback
      const firstCityGroup = groups[0];
      if (firstCityGroup) insertData.group_id = firstCityGroup.id;
    } else {
      insertData.group_id = activeGroupId;
    }
    
    const { error } = await supabase.from('community_messages').insert(insertData);
    
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

  const groupName = activeGroupType === 'cohort' ? cohortGroup?.name : groups.find((g) => g.id === activeGroupId)?.name;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-secondary/20">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          activeGroupType === 'cohort' ? "bg-primary/10" : "bg-green-500/10"
        )}>
          {activeGroupType === 'cohort' ? (
            <Users className="w-4 h-4 text-primary" />
          ) : (
            <MapPin className="w-4 h-4 text-green-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {groupName || 'Community Chat'}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {activeGroupType === 'cohort' ? 'Your cohort members' : 'Regional community'}
          </p>
        </div>
        {typingUsers.length > 0 && (
          <span className="text-xs text-muted-foreground animate-pulse shrink-0">
            {typingUsers[0]} typing...
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.user_id === user?.id} onReact={(emoji) => handleReact(msg.id, emoji)} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button size="icon" variant="secondary" className="absolute bottom-24 right-6 rounded-full shadow-lg w-8 h-8" onClick={scrollToBottom}>
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-border/40">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-border/40 bg-secondary/10">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="shrink-0 h-10 w-10"
        >
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 h-10 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button
          type="submit"
          disabled={(!message.trim() && !imageFile) || sending}
          className="shrink-0 h-10 w-10 p-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
};
