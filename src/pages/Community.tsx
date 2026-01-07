import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { MemberAvatarStrip } from '@/components/community/MemberAvatarStrip';
import { CompactChat } from '@/components/community/CompactChat';
import { CompactHighlights } from '@/components/community/CompactHighlights';
import { QuickAccessBar } from '@/components/community/QuickAccessBar';
import { Loader2 } from 'lucide-react';
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
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
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
    setStats({ totalMembers: members || 0, totalCities: new Set(cities?.map((p) => p.city).filter(Boolean)).size, totalFilms: films || 0 });
  };

  useEffect(() => {
    const channel = supabase.channel('stats-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Top Section - Compact Header */}
      <div className="space-y-3 pb-3">
        {/* Header Row */}
        <CommunityHeader memberCount={stats.totalMembers} onlineCount={onlineUserIds.length} />
        
        {/* Members Strip */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground px-1">Members</span>
          <MemberAvatarStrip onlineUserIds={onlineUserIds} />
        </div>

        {/* Highlights (if any) */}
        <CompactHighlights />

        {/* Quick Access */}
        <div className="hidden md:block">
          <QuickAccessBar />
        </div>
      </div>

      {/* Main Chat Area - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <CompactChat
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupChange={setActiveGroupId}
          typingUsers={typingUsers}
        />
      </div>

      {/* Mobile Quick Access */}
      <div className="md:hidden pt-3 pb-16">
        <QuickAccessBar />
      </div>
    </div>
  );
};

export default Community;
