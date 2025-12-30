import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { MentorCard } from '@/components/shared/MentorCard';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, GraduationCap, Lock, MessageCircle, Megaphone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    specialty: string | null;
  };
}

// Mock data - replace with actual data
const cityGroups = [
  { id: 'forge', name: 'Forge Community', isMain: true },
  { id: 'chennai', name: 'LevelUp Chennai' },
  { id: 'mumbai', name: 'LevelUp Mumbai' },
  { id: 'bangalore', name: 'LevelUp Bangalore' },
  { id: 'hyderabad', name: 'LevelUp Hyderabad' },
  { id: 'kerala', name: 'LevelUp Kerala' },
];

const mockMentors = [
  { id: '1', name: 'Virat Kohli', specialty: 'Entrepreneur' },
  { id: '2', name: 'Priyanka Chopra', specialty: 'Acting Coach' },
  { id: '3', name: 'Sundar Pichai', specialty: 'Tech Leadership' },
  { id: '4', name: 'Deepika Padukone', specialty: 'Brand Building' },
];

const mockAnnouncements = [
  { id: '1', title: 'Forge Mumbai Dates Confirmed!', date: 'Dec 28' },
  { id: '2', title: 'New Mentor Added: Sundar Pichai', date: 'Dec 27' },
  { id: '3', title: 'Early Bird Deadline Extended', date: 'Dec 25' },
];

const Community: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeGroup, setActiveGroup] = useState('forge');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('community-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, specialty')
          .eq('id', msg.user_id)
          .single();
        return { ...msg, profiles: profileData } as Message;
      })
    );

    setMessages(messagesWithProfiles);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    const { error } = await supabase
      .from('community_messages')
      .insert({
        user_id: user.id,
        content: newMessage.trim(),
      });

    setSending(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setNewMessage('');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">Connect with fellow creators and mentors</p>
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
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            {/* City Groups Sidebar */}
            <div className="space-y-4">
              {/* Group List */}
              <div className="bg-card rounded-xl border border-border/50 p-3 space-y-1">
                {cityGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                      activeGroup === group.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{group.name}</span>
                  </button>
                ))}
              </div>

              {/* Announcements */}
              <div className="bg-card rounded-xl border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Announcements</h3>
                </div>
                <div className="space-y-2">
                  {mockAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-medium text-foreground line-clamp-2">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col h-[calc(100vh-320px)] md:h-[calc(100vh-280px)] bg-card rounded-xl border border-border/50 overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="font-semibold text-foreground">
                  {cityGroups.find(g => g.id === activeGroup)?.name}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-muted-foreground">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Start the conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.user_id === user?.id;
                    const profileData = message.profiles;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isOwn ? 'gradient-primary' : 'bg-secondary'
                        }`}>
                          {profileData?.avatar_url ? (
                            <img 
                              src={profileData.avatar_url} 
                              alt="" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
                              {getInitials(profileData?.full_name)}
                            </span>
                          )}
                        </div>
                        
                        <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {isOwn ? 'You' : profileData?.full_name || 'Anonymous'}
                            </span>
                          </div>
                          <div className={`p-3 rounded-2xl ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-secondary text-foreground rounded-tl-sm'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary/50"
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
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
          <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mentor Access</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Connect directly with industry mentors. This channel opens after Forge begins.
            </p>
            <p className="text-sm text-primary">Opens after Forge starts</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
