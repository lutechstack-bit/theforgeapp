import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CommunityStatsBar } from '@/components/community/CommunityStatsBar';
import { MemberGrid } from '@/components/community/MemberGrid';
import { WhatsAppChat } from '@/components/community/WhatsAppChat';
import { HighlightsCard } from '@/components/community/HighlightsCard';
import { AfterForgeCard } from '@/components/community/AfterForgeCard';
import { Loader2, Users, MessageCircle } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CityGroup {
  id: string;
  name: string;
  city_key: string;
  is_main: boolean;
}

interface Stats {
  totalMembers: number;
  totalCities: number;
  totalFilms: number;
}

const Community = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<CityGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalCities: 0, totalFilms: 0 });
  
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (user) {
      initializeCommunity();
      setupPresenceChannel();
    }

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [user]);

  const initializeCommunity = async () => {
    setLoading(true);
    await Promise.all([fetchGroups(), fetchStats()]);
    setLoading(false);
  };

  const setupPresenceChannel = () => {
    if (!user) return;

    presenceChannelRef.current = supabase
      .channel('community-presence')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState() || {};
        const userIds = Object.values(state).flat().map((p: any) => p.user_id);
        setOnlineUserIds([...new Set(userIds)]);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id === user.id) return;
        setTypingUsers((prev) => prev.includes(payload.user_name) ? prev : [...prev, payload.user_name]);
        if (typingTimeoutRef.current[payload.user_id]) clearTimeout(typingTimeoutRef.current[payload.user_id]);
        typingTimeoutRef.current[payload.user_id] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((name) => name !== payload.user_name));
        }, 3000);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({ user_id: user.id, user_name: profile?.full_name || 'Unknown' });
        }
      });
  };

  const fetchGroups = async () => {
    const { data } = await supabase.from('city_groups').select('*').order('is_main', { ascending: false });
    setGroups(data || []);
    if (data?.length) {
      const userGroup = data.find((g) => g.city_key === profile?.city?.toLowerCase());
      setActiveGroupId(userGroup?.id || data.find((g) => g.is_main)?.id || data[0].id);
    }
  };

  const fetchStats = async () => {
    const [{ count: members }, { data: cities }, { count: films }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_setup_completed', true),
      supabase.from('profiles').select('city').eq('profile_setup_completed', true).not('city', 'is', null),
      supabase.from('student_films').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ 
      totalMembers: members || 0, 
      totalCities: new Set(cities?.map((p) => p.city).filter(Boolean)).size, 
      totalFilms: films || 0 
    });
  };

  // Subscribe to member count changes
  useEffect(() => {
    const channel = supabase
      .channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <CommunityHeader memberCount={stats.totalMembers} onlineCount={onlineUserIds.length} />

      {/* Stats Bar */}
      <CommunityStatsBar
        totalMembers={stats.totalMembers}
        totalCities={stats.totalCities}
        onlineNow={onlineUserIds.length}
        totalFilms={stats.totalFilms}
      />

      {/* Main Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Members Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Members</h3>
          </div>
          <MemberGrid onlineUserIds={onlineUserIds} />
        </div>

        {/* Chat Section */}
        <div className="h-[400px] lg:h-[500px]">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chat</h3>
          </div>
          <WhatsAppChat
            groups={groups}
            activeGroupId={activeGroupId}
            onGroupChange={setActiveGroupId}
            typingUsers={typingUsers}
          />
        </div>

        {/* Highlights */}
        <HighlightsCard />

        {/* After Forge Benefits */}
        <AfterForgeCard />
      </div>
    </div>
  );
};

export default Community;
