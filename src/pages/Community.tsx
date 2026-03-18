import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CompactChat } from '@/components/community/CompactChat';
import { GroupSwitcher } from '@/components/community/GroupSwitcher';
import { MembersDrawer } from '@/components/community/MembersDrawer';
import { CreativesDirectory } from '@/components/community/CreativesDirectory';
import { GigsBoard } from '@/components/community/GigsBoard';
import { CollaboratorInbox } from '@/components/community/CollaboratorInbox';
import { BatchmatesDirectory } from '@/components/community/BatchmatesDirectory';
import { Skeleton } from '@/components/ui/skeleton';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getCityGroupKey } from '@/lib/cityUtils';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

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

const Community = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isFeatureEnabled } = useFeatureFlags();
  const chatEnabled = isFeatureEnabled('community_chat_enabled');

  const [activeTab, setActiveTab] = useState<'creatives' | 'gigs' | 'chat'>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'gigs') return 'gigs';
    if (tab === 'chat' && chatEnabled) return 'chat';
    return 'creatives';
  });

  const [loading, setLoading] = useState(true);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [cohortGroup, setCohortGroup] = useState<CohortGroup | null>(null);
  const [activeGroupType, setActiveGroupType] = useState<'cohort' | 'city'>('cohort');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [userCityGroupId, setUserCityGroupId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (user) {
      initializeCommunity();
      if (chatEnabled) setupPresenceChannel();
    }
    return () => {
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [user]);

  const initializeCommunity = async () => {
    setLoading(true);
    await Promise.all([fetchCityGroups(), fetchCohortGroup()]);
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
        setTypingUsers(prev => prev.includes(payload.user_name) ? prev : [...prev, payload.user_name]);
        if (typingTimeoutRef.current[payload.user_id]) clearTimeout(typingTimeoutRef.current[payload.user_id]);
        typingTimeoutRef.current[payload.user_id] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(name => name !== payload.user_name));
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
      const matchingGroup = data.find(g => g.city_key === userCityKey);
      if (matchingGroup) setUserCityGroupId(matchingGroup.id);
    }
  };

  const fetchCohortGroup = async () => {
    if (!profile?.edition_id) return;
    const { data } = await supabase
      .from('cohort_groups')
      .select('*')
      .eq('edition_id', profile.edition_id)
      .maybeSingle();
    if (data) {
      setCohortGroup(data);
      setActiveGroupId(data.id);
      setActiveGroupType('cohort');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-4rem)] pt-4 sm:pt-5 md:pt-6 px-4 sm:px-5 md:px-6 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <div className="flex-1 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100dvh-4rem)] pt-4 sm:pt-5 md:pt-6 px-4 sm:px-5 md:px-6 gap-3 sm:gap-4 max-w-6xl mx-auto w-full">
      {/* Top row: pills + inbox */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 p-1 rounded-full bg-card border border-border/30 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('creatives')}
            className={cn(
              'px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95',
              activeTab === 'creatives' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Creatives
          </button>
          <button
            onClick={() => setActiveTab('gigs')}
            className={cn(
              'px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95',
              activeTab === 'gigs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Gigs
          </button>
          {chatEnabled && (
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95',
                activeTab === 'chat' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Chat
            </button>
          )}
        </div>
        {activeTab === 'chat' ? (
          <MembersDrawer onlineUserIds={onlineUserIds} memberCount={onlineUserIds.length} />
        ) : (
          <CollaboratorInbox />
        )}
      </div>

      {/* Content */}
      {activeTab === 'creatives' && (
        <div className="flex-1 min-h-0 overflow-y-auto pb-24">
          <CreativesDirectory onSetupProfile={() => navigate('/ky-section/community_profile')} />
        </div>
      )}

      {activeTab === 'gigs' && (
        <div className="flex-1 min-h-0 overflow-y-auto pb-24">
          <GigsBoard />
        </div>
      )}

      {activeTab === 'chat' && chatEnabled && (
        <>
          <CommunityHeader memberCount={onlineUserIds.length} onlineCount={onlineUserIds.length} />
          <GroupSwitcher
            cohortGroup={cohortGroup}
            cityGroups={cityGroups}
            userCityGroupId={userCityGroupId}
            activeGroupType={activeGroupType}
            activeGroupId={activeGroupId}
            onSelectCohort={() => {
              if (cohortGroup) { setActiveGroupType('cohort'); setActiveGroupId(cohortGroup.id); }
            }}
            onSelectCity={(id) => { setActiveGroupType('city'); setActiveGroupId(id); }}
          />
          <div className="flex-1 min-h-0">
            <CompactChat
              groups={cityGroups}
              cohortGroup={cohortGroup}
              activeGroupType={activeGroupType}
              activeGroupId={activeGroupId}
              onGroupChange={(id) => { setActiveGroupType('city'); setActiveGroupId(id); }}
              onCohortSelect={() => {
                if (cohortGroup) { setActiveGroupType('cohort'); setActiveGroupId(cohortGroup.id); }
              }}
              typingUsers={typingUsers}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Community;
