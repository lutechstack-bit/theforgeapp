import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { MentorCard } from '@/components/shared/MentorCard';
import { ChatBubble } from '@/components/community/ChatBubble';
import { GroupSidebar } from '@/components/community/GroupSidebar';
import { ChatInput } from '@/components/community/ChatInput';
import { useToast } from '@/hooks/use-toast';
import { Users, GraduationCap, Lock, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCityGroupKey } from '@/lib/cityUtils';

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string;
  image_url: string | null;
  is_announcement: boolean;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    specialty: string | null;
  };
  reactions: MessageReaction[];
}

const mockMentors = [
  { id: '1', name: 'Virat Kohli', specialty: 'Entrepreneur' },
  { id: '2', name: 'Priyanka Chopra', specialty: 'Acting Coach' },
  { id: '3', name: 'Sundar Pichai', specialty: 'Tech Leadership' },
  { id: '4', name: 'Deepika Padukone', specialty: 'Brand Building' },
];

const Community: React.FC = () => {
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [userCityGroupId, setUserCityGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Fetch city groups and determine user's city group
  useEffect(() => {
    const fetchGroups = async () => {
      const { data: groups, error } = await supabase
        .from('city_groups')
        .select('*')
        .order('is_main', { ascending: false });

      if (error) {
        console.error('Error fetching city groups:', error);
        return;
      }

      setCityGroups(groups || []);

      // Find user's city group based on their profile city
      const userCityKey = getCityGroupKey(profile?.city);
      const userGroup = groups?.find(g => g.city_key === userCityKey);
      const mainGroup = groups?.find(g => g.is_main);
      
      if (userGroup) {
        setUserCityGroupId(userGroup.id);
      }
      
      // Default to main group (All Forge)
      if (mainGroup) {
        setActiveGroupId(mainGroup.id);
      }
    };

    fetchGroups();
  }, [profile?.city]);

  // Fetch messages for active group
  const fetchMessages = useCallback(async () => {
    if (!activeGroupId) return;

    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .eq('group_id', activeGroupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Fetch profiles and reactions for each message
    const messagesWithData = await Promise.all(
      (data || []).map(async (msg) => {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, specialty')
          .eq('id', msg.user_id)
          .single();

        // Fetch reactions
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('emoji, user_id')
          .eq('message_id', msg.id);

        // Aggregate reactions
        const reactionMap: Record<string, { count: number; hasReacted: boolean }> = {};
        (reactionsData || []).forEach((r) => {
          if (!reactionMap[r.emoji]) {
            reactionMap[r.emoji] = { count: 0, hasReacted: false };
          }
          reactionMap[r.emoji].count++;
          if (r.user_id === user?.id) {
            reactionMap[r.emoji].hasReacted = true;
          }
        });

        const reactions = Object.entries(reactionMap).map(([emoji, data]) => ({
          emoji,
          ...data,
        }));

        return { 
          ...msg, 
          profiles: profileData,
          reactions,
        } as Message;
      })
    );

    setMessages(messagesWithData);
    setLoading(false);
  }, [activeGroupId, user?.id]);

  useEffect(() => {
    if (activeGroupId) {
      setLoading(true);
      fetchMessages();
    }
  }, [activeGroupId, fetchMessages]);

  // Real-time subscriptions
  useEffect(() => {
    if (!activeGroupId) return;

    const messagesChannel = supabase
      .channel('community-messages-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'community_messages',
          filter: `group_id=eq.${activeGroupId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('reactions-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'message_reactions'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [activeGroupId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, imageFile?: File) => {
    if (!user || !activeGroupId) return;

    let imageUrl: string | null = null;

    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('community-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('community-images')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('community_messages')
      .insert({
        user_id: user.id,
        content: content || '',
        group_id: activeGroupId,
        image_url: imageUrl,
        is_announcement: false,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if user already reacted with this emoji
    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Remove reaction
      await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existing.id);
    } else {
      // Add reaction
      await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });
    }
  };

  const activeGroup = cityGroups.find(g => g.id === activeGroupId);

  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Community</h1>
        <p className="text-muted-foreground text-sm">Connect with fellow Forgers</p>
      </div>

      <Tabs defaultValue="p2p" className="space-y-4">
        <TabsList className="w-full max-w-xs bg-secondary/50">
          <TabsTrigger value="p2p" className="flex-1 gap-2">
            <Users className="h-4 w-4" />
            P2P
          </TabsTrigger>
          <TabsTrigger value="p2m" className="flex-1 gap-2">
            <GraduationCap className="h-4 w-4" />
            P2M
          </TabsTrigger>
        </TabsList>

        {/* P2P - Peer to Peer */}
        <TabsContent value="p2p" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Groups Sidebar */}
            <div className="order-2 lg:order-1">
              <GroupSidebar
                groups={cityGroups}
                activeGroupId={activeGroupId}
                userCityGroupId={userCityGroupId}
                onSelectGroup={setActiveGroupId}
              />
            </div>

            {/* Chat Area */}
            <div className="order-1 lg:order-2 flex flex-col h-[calc(100vh-280px)] bg-gradient-to-b from-card to-card/80 rounded-2xl border border-border/50 overflow-hidden shadow-xl">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-border/30 bg-card/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeGroup?.is_main 
                      ? "bg-gradient-to-br from-primary to-primary/60" 
                      : "bg-gradient-to-br from-secondary to-secondary/60"
                  )}>
                    <Users className={cn(
                      "h-5 w-5",
                      activeGroup?.is_main ? "text-primary-foreground" : "text-foreground"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {activeGroup?.name || 'Select a group'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activeGroup?.is_main ? 'All Forge members' : 'Your local community'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">Start the conversation</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Be the first to break the ice! Say hello to your fellow Forgers.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      id={message.id}
                      content={message.content}
                      imageUrl={message.image_url}
                      createdAt={message.created_at}
                      isOwn={message.user_id === user?.id}
                      isAnnouncement={message.is_announcement}
                      senderName={message.profiles?.full_name || 'Anonymous'}
                      senderAvatar={message.profiles?.avatar_url}
                      senderSpecialty={message.profiles?.specialty}
                      reactions={message.reactions}
                      onReact={handleReact}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput
                onSend={handleSendMessage}
                disabled={!activeGroupId}
                placeholder={`Message ${activeGroup?.name || 'the group'}...`}
              />
            </div>
          </div>
        </TabsContent>

        {/* P2M - Peer to Mentor */}
        <TabsContent value="p2m" className="mt-0 space-y-6">
          {/* Mentors Carousel */}
          <ContentCarousel title="Our Mentors">
            {mockMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                name={mentor.name}
                specialty={mentor.specialty}
              />
            ))}
          </ContentCarousel>

          {/* Mentor Chat (Locked) */}
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Mentor Access</h3>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              Connect directly with industry mentors. This channel opens after Forge begins.
            </p>
            <p className="text-sm text-primary font-medium">Opens after Forge starts</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
