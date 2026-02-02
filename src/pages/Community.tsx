import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CompactChat } from '@/components/community/CompactChat';
import { GroupSwitcher } from '@/components/community/GroupSwitcher';
import { MembersDrawer } from '@/components/community/MembersDrawer';
import { Loader2 } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getCityGroupKey } from '@/lib/cityUtils';

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

interface Stats {
  totalMembers: number;
  totalCities: number;
  totalFilms: number;
}

const Community = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [cohortGroup, setCohortGroup] = useState<CohortGroup | null>(null);
  const [activeGroupType, setActiveGroupType] = useState<'cohort' | 'city'>('cohort');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [userCityGroupId, setUserCityGroupId] = useState<string | null>(null);
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
    await Promise.all([fetchCityGroups(), fetchCohortGroup(), fetchStats()]);
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

  const fetchCityGroups = async () => {
    const { data } = await supabase.from('city_groups').select('*').order('is_main', { ascending: false });
    setCityGroups(data || []);
    
    if (data?.length && profile?.city) {
      const userCityKey = getCityGroupKey(profile.city);
      const matchingGroup = data.find((g) => g.city_key === userCityKey);
      if (matchingGroup) {
        setUserCityGroupId(matchingGroup.id);
      }
    }
  };

  const fetchCohortGroup = async () => {
    // Allow community to load even without edition - user can still use city groups
    if (!profile?.edition_id) {
      // Default to first city group if available
      if (cityGroups.length > 0) {
        setActiveGroupId(cityGroups[0].id);
        setActiveGroupType('city');
      }
      return;
    }
    
    const { data } = await supabase
      .from('cohort_groups')
      .select('*')
      .eq('edition_id', profile.edition_id)
      .maybeSingle(); // Use maybeSingle to prevent error if not found
    
    if (data) {
      setCohortGroup(data);
      setActiveGroupId(data.id);
      setActiveGroupType('cohort');
    } else {
      // No cohort group found - default to first city group
      if (cityGroups.length > 0) {
        setActiveGroupId(cityGroups[0].id);
        setActiveGroupType('city');
      }
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

  const handleSelectCohort = () => {
    if (cohortGroup) {
      setActiveGroupType('cohort');
      setActiveGroupId(cohortGroup.id);
    }
  };

  const handleSelectCity = (groupId: string) => {
    setActiveGroupType('city');
    setActiveGroupId(groupId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-4rem)] px-3 sm:px-4 gap-2.5 sm:gap-3">
      {/* Header with Members Button */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <CommunityHeader memberCount={stats.totalMembers} onlineCount={onlineUserIds.length} />
        <MembersDrawer onlineUserIds={onlineUserIds} memberCount={stats.totalMembers} />
      </div>

      {/* Horizontal Pill Tabs */}
      <GroupSwitcher
        cohortGroup={cohortGroup}
        cityGroups={cityGroups}
        userCityGroupId={userCityGroupId}
        activeGroupType={activeGroupType}
        activeGroupId={activeGroupId}
        onSelectCohort={handleSelectCohort}
        onSelectCity={handleSelectCity}
      />

      {/* Chat Area - Full Width */}
      <div className="flex-1 min-h-0">
        <CompactChat
          groups={cityGroups}
          cohortGroup={cohortGroup}
          activeGroupType={activeGroupType}
          activeGroupId={activeGroupId}
          onGroupChange={handleSelectCity}
          onCohortSelect={handleSelectCohort}
          typingUsers={typingUsers}
        />
      </div>
    </div>
  );
};

export default Community;
