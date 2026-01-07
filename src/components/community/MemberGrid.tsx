import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MemberCard } from './MemberCard';
import { MemberModal } from './MemberModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
}

interface MemberGridProps {
  onlineUserIds: string[];
}

export const MemberGrid: React.FC<MemberGridProps> = ({ onlineUserIds }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();

    // Subscribe to new members
    const channel = supabase
      .channel('members-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const newMember = payload.new as Member;
          setMembers((prev) => {
            if (prev.some(m => m.id === newMember.id)) return prev;
            return [...prev, newMember];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedMember = payload.new as Member;
          setMembers((prev) =>
            prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, specialty')
        .eq('profile_setup_completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 min-w-[100px]">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-12 h-3" />
          </div>
        ))}
      </div>
    );
  }

  // Filter out current user and show others
  const otherMembers = members.filter(m => m.id !== user?.id);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
        {otherMembers.map((member) => (
          <MemberCard
            key={member.id}
            id={member.id}
            fullName={member.full_name || 'Member'}
            avatarUrl={member.avatar_url}
            city={member.city}
            specialty={member.specialty}
            isOnline={onlineUserIds.includes(member.id)}
            onClick={() => setSelectedMember(member)}
          />
        ))}
        {otherMembers.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No other members yet. Be the first to invite friends!
          </p>
        )}
      </div>

      <MemberModal
        member={selectedMember}
        isOnline={selectedMember ? onlineUserIds.includes(selectedMember.id) : false}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
};
