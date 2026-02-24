import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { useUserWorks, UserWork, CreateWorkInput } from '@/hooks/useUserWorks';
import { usePublicPortfolio } from '@/hooks/usePublicPortfolio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { PerksQuickAccess } from '@/components/profile/PerksQuickAccess';
import { KYFormQuickAccess } from '@/components/profile/KYFormQuickAccess';

const ProfileSkeleton = () => (
  <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto page-container space-y-4 pb-24 md:pb-6">
    <Skeleton className="h-48 rounded-2xl" />
    <Skeleton className="h-20 rounded-2xl" />
    <Skeleton className="h-32 rounded-2xl" />
    <Skeleton className="h-24 rounded-2xl" />
  </div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, edition, signOut, refreshProfile } = useAuth();
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useProfileData();
  const { works, createWork, updateWork, deleteWork } = useUserWorks();
  const { portfolio, isPublic, getPortfolioUrl, createOrUpdatePortfolio } = usePublicPortfolio();

  const [searchParams, setSearchParams] = useSearchParams();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [addWorkOpen, setAddWorkOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<UserWork | null>(null);
  const [deleteWorkId, setDeleteWorkId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const sectionParam = searchParams.get('section');

  // Auto-open edit sheet if action=edit is in URL
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam === 'edit') {
      setEditSheetOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    toast({ title: 'Bio Updated', description: 'Your bio has been saved.' });
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
    setDeleteWorkId(workId);
  };

  const confirmDeleteWork = async () => {
    if (deleteWorkId) {
      await deleteWork.mutateAsync(deleteWorkId);
      setDeleteWorkId(null);
    }
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

  if (profileLoading && !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto page-container space-y-4 sm:space-y-5 pb-24 md:pb-6">
      {/* Profile Hero */}
      <ProfileHero
        profile={profile}
        edition={edition}
        isOwner={true}
        onEdit={() => setEditSheetOpen(true)}
      />

      {/* KY Form Quick Access */}
      <KYFormQuickAccess 
        isCompleted={profile?.ky_form_completed || false}
        cohortType={profileData?.cohortType || null}
      />

      {/* Perks Quick Access */}
      <PerksQuickAccess />

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

      {/* Sign Out with confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Work confirmation */}
      <AlertDialog open={!!deleteWorkId} onOpenChange={(open) => !open && setDeleteWorkId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this work?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this work from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWork} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      <ProfileEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        profile={profile}
        onSaved={handleProfileSaved}
        scrollToSection={sectionParam}
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
