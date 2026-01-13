import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolioBySlug } from '@/hooks/usePublicPortfolio';
import { getSkillsCount } from '@/components/profile/VerifiedInfoCard';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { QuickStatsRow } from '@/components/profile/QuickStatsRow';
import { AboutSection } from '@/components/profile/AboutSection';
import { VerifiedInfoCard } from '@/components/profile/VerifiedInfoCard';
import { WorksSection } from '@/components/profile/WorksSection';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import forgeLogo from '@/assets/forge-logo.png';

const PublicPortfolio: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePortfolioBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Portfolio Not Found</h1>
        <p className="text-muted-foreground mb-6">This portfolio doesn't exist or is private.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  const { profile, works: rawWorks, kyResponse, cohortType } = data;
  const edition = profile?.editions;
  
  // Transform works to ensure award_tags is properly typed
  const works = rawWorks.map(work => ({
    ...work,
    award_tags: Array.isArray(work.award_tags) ? work.award_tags as string[] : []
  }));
  
  const skillsCount = getSkillsCount(cohortType, 
    cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS' ? kyResponse : null,
    cohortType === 'FORGE_WRITING' ? kyResponse : null
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between max-w-3xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <img src={forgeLogo} alt="Forge" className="h-8" />
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Join Forge
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6 max-w-3xl mx-auto">
        <ProfileHero
          profile={profile}
          edition={edition}
          isOwner={false}
        />

        <QuickStatsRow
          editionName={edition?.name}
          city={edition?.city}
          skillsCount={skillsCount}
          messageCount={0}
          worksCount={works.length}
        />

        <AboutSection bio={profile?.bio} isOwner={false} />

        <VerifiedInfoCard
          cohortType={cohortType}
          kyfResponse={cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS' ? kyResponse : undefined}
          kywResponse={cohortType === 'FORGE_WRITING' ? kyResponse : undefined}
          isPublicView={true}
        />

        <WorksSection works={works} isOwner={false} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 mt-12">
        <div className="container text-center max-w-3xl mx-auto">
          <img src={forgeLogo} alt="Forge" className="h-6 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Portfolio powered by LevelUp Forge
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
