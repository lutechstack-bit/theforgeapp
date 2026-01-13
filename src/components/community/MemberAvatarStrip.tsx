import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberModal } from './MemberModal';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
}

interface MemberAvatarStripProps {
  onlineUserIds: string[];
}

export const MemberAvatarStrip: React.FC<MemberAvatarStripProps> = ({ onlineUserIds }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchMembers();
    const channel = supabase
      .channel('members-strip')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchMembers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, city, specialty')
      .eq('profile_setup_completed', true)
      .order('created_at', { ascending: false })
      .limit(20);
    setMembers(data || []);
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const otherMembers = members.filter(m => m.id !== user?.id);
  const onlineMembers = otherMembers.filter(m => onlineUserIds.includes(m.id));
  const offlineMembers = otherMembers.filter(m => !onlineUserIds.includes(m.id));
  const sortedMembers = [...onlineMembers, ...offlineMembers];
  const displayMembers = showAll ? sortedMembers : sortedMembers.slice(0, 10);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5 overflow-hidden">
          {displayMembers.map((member, index) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={cn(
                "relative transition-transform hover:scale-110 hover:z-10",
              )}
              style={{ zIndex: displayMembers.length - index }}
            >
              <Avatar className="w-8 h-8 border-2 border-background ring-1 ring-border/20">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                  {getInitials(member.full_name || '')}
                </AvatarFallback>
              </Avatar>
              {onlineUserIds.includes(member.id) && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />
              )}
            </button>
          ))}
        </div>
        
        {sortedMembers.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            {showAll ? 'Less' : `+${sortedMembers.length - 10}`}
            <ChevronRight className={cn("w-3 h-3 transition-transform", showAll && "rotate-90")} />
          </button>
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
