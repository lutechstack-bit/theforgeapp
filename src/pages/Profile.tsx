import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { useUserWorks, UserWork, CreateWorkInput } from '@/hooks/useUserWorks';
import { usePublicPortfolio } from '@/hooks/usePublicPortfolio';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Gift, ChevronRight, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProfileEditSheet } from '@/components/profile/ProfileEditSheet';
import { AddWorkModal } from '@/components/profile/AddWorkModal';
import { PrintableProfile } from '@/components/profile/PrintableProfile';
import { BentoProfileHero } from '@/components/profile/BentoProfileHero';
import { BentoAboutTile } from '@/components/profile/BentoAboutTile';
import { BentoGeneralTile } from '@/components/profile/BentoGeneralTile';
import { BentoProficiencyTile } from '@/components/profile/BentoProficiencyTile';
import { BentoMBTITile } from '@/components/profile/BentoMBTITile';
import { BentoPracticeTile } from '@/components/profile/BentoPracticeTile';
import { BentoInfluencesTile } from '@/components/profile/BentoInfluencesTile';
import { BentoPersonalTile } from '@/components/profile/BentoPersonalTile';
import { BentoWorksTile } from '@/components/profile/BentoWorksTile';
import { BentoBadgesTile } from '@/components/profile/BentoBadgesTile';
import { BentoShareTile } from '@/components/profile/BentoShareTile';

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto page-container space-y-4 pb-24 md:pb-6">
    <Skeleton className="h-[420px] rounded-2xl" />
    <div className="grid grid-cols-12 gap-3.5">
      <Skeleton className="col-span-8 h-60 rounded-xl" />
      <Skeleton className="col-span-4 h-60 rounded-xl" />
      <Skeleton className="col-span-7 h-80 rounded-xl" />
      <Skeleton className="col-span-5 h-80 rounded-xl" />
    </div>
  </div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, edition, refreshProfile } = useAuth();
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

  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam === 'edit') {
      setEditSheetOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const isVerified = profile?.ky_form_completed && profile?.payment_status === 'BALANCE_PAID';
  const kyData = profileData?.kyfResponse || profileData?.kywResponse || profileData?.kycResponse;

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

  const openEditSheet = (section?: string) => {
    if (section) {
      searchParams.set('section', section);
      setSearchParams(searchParams, { replace: true });
    }
    setEditSheetOpen(true);
  };

  if (profileLoading && !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-6">
      {/* Cinematic Hero */}
      <BentoProfileHero
        profile={profile}
        edition={edition}
        isOwner={true}
        onEdit={() => setEditSheetOpen(true)}
      />

      {/* Action Strip */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center px-4 sm:px-6 md:px-0 py-3 border-b border-primary/10 mb-6">
        <Link
          to="/kyf"
          className={`flex items-center gap-2 px-3.5 py-2 border rounded-lg text-xs transition-all cursor-pointer ${
            profile?.ky_form_completed
              ? 'border-primary/10 bg-card text-muted-foreground hover:border-primary/25'
              : 'border-primary/35 bg-primary/7 text-primary'
          }`}
        >
          {profile?.ky_form_completed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
          {profile?.ky_form_completed ? 'KY Form — Complete' : 'Complete KY Form'}
        </Link>

        <Link
          to="/perks"
          className="flex items-center gap-2 px-3.5 py-2 border border-primary/10 bg-card rounded-lg text-xs text-muted-foreground hover:border-primary/25 transition-all cursor-pointer"
        >
          <Gift className="h-3.5 w-3.5" />
          My Perks & Acceptance ›
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 px-4 sm:px-6 md:px-0">
        <BentoAboutTile
          bio={profile?.bio}
          isOwner={true}
          onEdit={() => openEditSheet('about')}
        />

        <BentoGeneralTile
          kyData={kyData}
          cohortType={profileData?.cohortType || null}
          onEdit={() => openEditSheet('general')}
        />

        <BentoProficiencyTile
          cohortType={profileData?.cohortType || null}
          kyfResponse={profileData?.kyfResponse}
          kywResponse={profileData?.kywResponse}
          kycResponse={profileData?.kycResponse}
          onEdit={() => openEditSheet('proficiency')}
        />

        <BentoMBTITile
          mbtiType={kyData?.mbti_type}
          onEdit={() => openEditSheet('personality')}
        />

        <BentoPracticeTile
          cohortType={profileData?.cohortType || null}
          kywResponse={profileData?.kywResponse}
          kyfResponse={profileData?.kyfResponse}
          kyData={kyData}
          onEdit={() => openEditSheet('practice')}
        />

        <BentoInfluencesTile
          cohortType={profileData?.cohortType || null}
          kyfResponse={profileData?.kyfResponse}
          kywResponse={profileData?.kywResponse}
          kyData={kyData}
          onEdit={() => openEditSheet('influences')}
        />

        <BentoWorksTile
          works={works}
          isOwner={true}
          onAddWork={() => { setEditingWork(null); setAddWorkOpen(true); }}
          onEditWork={handleEditWork}
          onDeleteWork={handleDeleteWork}
        />

        <BentoBadgesTile
          isVerified={isVerified}
          messageCount={profileData?.messageCount || 0}
          hasStudentFilm={false}
          memberSince={(profile as any)?.created_at}
        />

        <BentoPersonalTile
          kyData={kyData}
          kywResponse={profileData?.kywResponse}
          onEdit={() => openEditSheet('personal')}
        />

        <BentoShareTile
          isPublic={isPublic}
          portfolioUrl={getPortfolioUrl()}
          onTogglePublic={handleTogglePublic}
          onDownloadPDF={handleDownloadPDF}
          isUpdating={createOrUpdatePortfolio.isPending}
        />
      </div>

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
