import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MemberCard } from './MemberCard';
import { MemberModal } from './MemberModal';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  specialty: string | null;
  edition_id: string | null;
}

interface MembersDrawerProps {
  onlineUserIds: string[];
  memberCount: number;
}

export const MembersDrawer: React.FC<MembersDrawerProps> = ({ onlineUserIds, memberCount }) => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cohortMembers, setCohortMembers] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('cohort');

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, profile?.edition_id]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Fetch all community members
      const { data: allData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, specialty, edition_id')
        .eq('profile_setup_completed', true)
        .order('full_name', { ascending: true });

      const members = allData || [];
      setAllMembers(members.filter(m => m.id !== user?.id));

      // Filter cohort members if user has an edition
      if (profile?.edition_id) {
        const cohort = members.filter(m => m.edition_id === profile.edition_id && m.id !== user?.id);
        setCohortMembers(cohort);
      } else {
        setCohortMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMemberList = (members: Member[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 cursor-pointer",
              "hover:bg-secondary/50 transition-colors"
            )}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.full_name || 'Member'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">
                    {(member.full_name || 'M').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {onlineUserIds.includes(member.id) && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="text-center min-w-0 w-full">
              <p className="text-sm font-medium text-foreground truncate">{member.full_name || 'Member'}</p>
              {member.city && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{member.city}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Members</span>
            <span className="text-xs text-muted-foreground">({memberCount})</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-lg font-semibold">Community Members</SheetTitle>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="mx-4 mt-4 grid grid-cols-2 h-10">
              <TabsTrigger value="cohort" className="text-sm">
                My Cohort
                {cohortMembers.length > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">({cohortMembers.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-sm">
                All Community
                <span className="ml-1.5 text-xs text-muted-foreground">({allMembers.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cohort" className="flex-1 overflow-y-auto mt-0">
              {!profile?.edition_id ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    You'll see your cohort members once you're assigned to an edition.
                  </p>
                </div>
              ) : (
                renderMemberList(cohortMembers, "No other members in your cohort yet.")
              )}
            </TabsContent>
            
            <TabsContent value="all" className="flex-1 overflow-y-auto mt-0">
              {renderMemberList(allMembers, "No community members yet.")}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <MemberModal
        member={selectedMember}
        isOnline={selectedMember ? onlineUserIds.includes(selectedMember.id) : false}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
};
