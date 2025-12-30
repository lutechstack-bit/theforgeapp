import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, GraduationCap, Lock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

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

const Community: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
        (payload) => {
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

    // Fetch profiles separately
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
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">Connect with fellow creators</p>
      </div>

      <Tabs defaultValue="peers" className="space-y-4">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="peers" className="flex-1 gap-2">
            <Users className="h-4 w-4" />
            Peer Chat
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex-1 gap-2" disabled>
            <GraduationCap className="h-4 w-4" />
            Mentors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peers" className="mt-0">
          <div className="flex flex-col h-[calc(100vh-280px)] bg-card rounded-xl border border-border/50 overflow-hidden">
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
                    Be the first to say hello and introduce yourself to the community!
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
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
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
                          <span className="text-sm font-medium text-foreground">
                            {isOwn ? 'You' : profileData?.full_name || 'Anonymous'}
                          </span>
                          {profileData?.specialty && (
                            <span className="text-xs text-muted-foreground">
                              • {profileData.specialty}
                            </span>
                          )}
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
        </TabsContent>

        <TabsContent value="mentors" className="mt-0">
          <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] bg-card rounded-xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mentor Access</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Connect directly with industry mentors. This channel opens after Forge begins.
            </p>
            <p className="text-sm text-primary">Opens after Forge.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
