import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { useUserWorks, UserWork, CreateWorkInput } from '@/hooks/useUserWorks';
import { usePublicPortfolio } from '@/hooks/usePublicPortfolio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ProfileHero,
  AboutSection,
  VerifiedInfoCard,
  WorksSection,
  AddWorkModal,
  CommunityBadges,
  SharePortfolio,
  ProfileEditSheet,
  PrintableProfile,
} from '@/components/profile';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, edition, signOut, refreshProfile } = useAuth();
  const { data: profileData, refetch: refetchProfile } = useProfileData();
  const { works, createWork, updateWork, deleteWork } = useUserWorks();
  const { portfolio, isPublic, getPortfolioUrl, createOrUpdatePortfolio } = usePublicPortfolio();

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [addWorkOpen, setAddWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<UserWork | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const isVerified = profile?.ky_form_completed && profile?.payment_status === 'BALANCE_PAID';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    navigate('/auth');
  };

  const handleSaveBio = async (bio: string) => {
    if (!user?.id) return;
    await supabase.from('profiles').update({ bio }).eq('id', user.id);
    await refreshProfile();
  };

  const handleAddWork = async (data: CreateWorkInput) => {
    if (editingWork) {
      await updateWork.mutateAsync({ id: editingWork.id, ...data });
    } else {
      await createWork.mutateAsync(data);
    }
    setEditingWork(null);
  };

  const handleEditWork = (work: UserWork) => {
    setEditingWork(work);
    setAddWorkOpen(true);
  };

  const handleDeleteWork = async (workId: string) => {
    await deleteWork.mutateAsync(workId);
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    await createOrUpdatePortfolio.mutateAsync({ isPublic });
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleProfileSaved = async () => {
    await refreshProfile();
    refetchProfile();
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-5 pb-24 md:pb-6 pt-2 sm:pt-0">
      {/* Profile Hero */}
      <ProfileHero
        profile={profile}
        edition={edition}
        isOwner={true}
        onEdit={() => setEditSheetOpen(true)}
      />

      {/* About Section */}
      <AboutSection
        bio={profile?.bio}
        isOwner={true}
        onSave={handleSaveBio}
      />

      {/* Verified Info */}
      <VerifiedInfoCard
        cohortType={profileData?.cohortType || null}
        kyfResponse={profileData?.kyfResponse}
        kywResponse={profileData?.kywResponse}
      />

      {/* Works Section */}
      <WorksSection
        works={works}
        isOwner={true}
        onAddWork={() => { setEditingWork(null); setAddWorkOpen(true); }}
        onEditWork={handleEditWork}
        onDeleteWork={handleDeleteWork}
      />

      {/* Community Badges */}
      <CommunityBadges
        isVerified={isVerified}
        messageCount={profileData?.messageCount || 0}
        hasStudentFilm={false}
        memberSince={(profile as any)?.created_at}
      />

      {/* Share Portfolio */}
      <SharePortfolio
        isPublic={isPublic}
        portfolioUrl={getPortfolioUrl()}
        isOwner={true}
        onTogglePublic={handleTogglePublic}
        onDownloadPDF={handleDownloadPDF}
        isUpdating={createOrUpdatePortfolio.isPending}
      />

      {/* Sign Out */}
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>

      {/* Modals */}
      <ProfileEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        profile={profile}
        onSaved={handleProfileSaved}
      />

      <AddWorkModal
        open={addWorkOpen}
        onOpenChange={(open) => { setAddWorkOpen(open); if (!open) setEditingWork(null); }}
        onSave={handleAddWork}
        editingWork={editingWork}
      />

      {/* Printable Version */}
      <PrintableProfile
        ref={printRef}
        profile={profile}
        edition={edition}
        kyResponse={profileData?.kyfResponse || profileData?.kywResponse}
        cohortType={profileData?.cohortType || null}
        works={works}
      />
    </div>
  );
};

export default Profile;
