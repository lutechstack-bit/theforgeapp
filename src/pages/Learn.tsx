import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';

interface ExploreProgram {
  id: string;
  title: string;
  description: string | null;
  label: string | null;
  image_url: string | null;
  redirect_url: string | null;
  gradient: string | null;
  program_tab: string;
  order_index: number;
  is_active: boolean;
}
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { ContinueWatchingCarousel } from '@/components/learn/ContinueWatchingCarousel';
import { UpcomingSessionsSection } from '@/components/learn/UpcomingSessionsSection';
import { MasterclassCard } from '@/components/learn/MasterclassCard';
import { ProgramBanner } from '@/components/learn/ProgramBanner';
import { ScrollableCardRow } from '@/components/learn/ScrollableCardRow';
import { EmptyState } from '@/components/shared/EmptyState';
import LevelUpCourseCard from '@/components/learn/LevelUpCourseCard';
import { Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { CinematicHero } from '@/components/shared/CinematicHero';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import levelUpLogo from '@/assets/levelup-logo.png';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_source_type?: 'upload' | 'embed';
  instructor_name?: string;
  company_name?: string;
  full_description?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  category: string;
  order_index: number;
}

interface WatchProgress {
  learn_content_id: string;
  progress_seconds: number;
  total_seconds?: number;
  completed: boolean;
}

// forgeResidencies removed — now fetched from explore_programs table

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { effectiveCohortType } = useEffectiveCohort();
  const { isFeatureEnabled } = useFeatureFlags();
  const [programTab, setProgramTab] = useState<'online' | 'offline'>('online');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['learn_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as (LearnContent & { card_layout?: string })[];
    },
  });

  const { data: explorePrograms = [] } = useQuery({
    queryKey: ['explore-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('explore_programs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as ExploreProgram[];
    },
  });

  const { data: watchProgress = [] } = useQuery({
    queryKey: ['learn_watch_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('learn_watch_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as WatchProgress[];
    },
    enabled: !!user?.id,
  });

  const getProgressPercent = (contentId: string, durationMinutes?: number) => {
    const progress = watchProgress.find(p => p.learn_content_id === contentId);
    if (!progress) return 0;
    const totalSeconds = progress.total_seconds || (durationMinutes ? durationMinutes * 60 : 0);
    if (!totalSeconds) return 0;
    return Math.round((progress.progress_seconds / totalSeconds) * 100);
  };

  const isCompleted = (contentId: string) => {
    const progress = watchProgress.find(p => p.learn_content_id === contentId);
    return progress?.completed || false;
  };

  const handleCardClick = (content: LearnContent) => {
    navigate(`/learn/${content.id}`);
  };

  // Group content
  const forgeOnlineSessions = courses.filter(c => c.section_type === 'bfp_sessions');
  const communitySessions = courses.filter(c => c.section_type === 'community_sessions');
  const masterclassCards = [
    { name: 'Lokesh Kanagaraj', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/6899f2de01c2b6f380973a82_Frame%20191%20LK.png', url: 'https://masterclass.leveluplearning.in/lokesh-kanagaraj' },
    { name: 'Nelson Dilipkumar', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/6878bd67851730bc31658da7_NM.png', url: 'https://masterclass.leveluplearning.in/' },
    { name: 'Karthik Subbaraj', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/650c1be5224f49f6432aaae6_1.Karthik_Subburaj%20course%20banner.png', url: 'https://masterclass.leveluplearning.in/karthik-subbaraj' },
    { name: 'G Venket Ram', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64f2f14d67e5504737c57ea5_2.Venket_Ram.png', url: 'https://www.leveluplearning.in/g-venket-ram-1' },
    { name: 'Anthony', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64f60ddd91f67b7db8f6716b_3.Anthony_Gonsalvez.png', url: 'https://www.leveluplearning.in/anthony' },
    { name: 'DRK Kiran', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64b79ef6d61b238747788c6c_kiran%20website%201.webp', url: 'https://www.leveluplearning.in/kiran' },
    { name: 'Ravi Basrur', image: 'https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64b79ef642421ae3cbe004d9_ravi%20website%201.webp', url: 'https://masterclass.leveluplearning.in/ravi-basrur' },
  ];

  // Continue watching
  const continueWatchingItems = courses
    .filter(c => {
      const progress = getProgressPercent(c.id, c.duration_minutes);
      return progress > 0 && !isCompleted(c.id);
    })
    .map(c => ({
      id: c.id,
      title: c.title,
      thumbnail_url: c.thumbnail_url,
      instructor_name: c.instructor_name,
      duration_minutes: c.duration_minutes,
      progress_percent: getProgressPercent(c.id, c.duration_minutes),
      is_completed: isCompleted(c.id),
    }))
    .sort((a, b) => b.progress_percent - a.progress_percent);

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-clip">
      <div className="page-container space-y-5 sm:space-y-6 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
        {/* Hero */}
        <CinematicHero
          icon={BookOpen}
          title={<>Develop Your <span>Craft</span></>}
          subtitle="Sessions, masterclasses & more"
          badge="Learning"
        />

        {/* Upcoming Online Sessions */}
        <UpcomingSessionsSection />

        {/* Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatchingCarousel
            items={continueWatchingItems}
            onItemClick={(item) => {
              const content = courses.find(c => c.id === item.id);
              if (content) handleCardClick(content);
            }}
          />
        )}

        {/* Loading / Empty */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl skeleton-premium animate-slide-up-fade"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No sessions yet"
            description="Check back soon for new content"
          />
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Pre Forge Sessions — only for FORGE cohort, gated by feature flag */}
            {isFeatureEnabled('pre_forge_sessions_enabled') && (!effectiveCohortType || effectiveCohortType === 'FORGE') && (
              <CourseCarouselSection
                items={forgeOnlineSessions}
                title="Pre Forge Sessions"
                subtitle="Filmmaking fundamentals: For Forge and Beyond"
                sectionType="bfp_sessions"
                gridLayout={true}
                defaultCardLayout="landscape"
                defaultThumbnail="/images/learn/pre-forge-placeholder.png"
                onCardClick={handleCardClick}
                onViewAll={(st) => navigate(`/learn/all?section=${st}`)}
              />
            )}

          </div>
        )}

        {/* LevelUp Zone */}
        <div className="bg-white/[0.03] -mx-4 sm:-mx-5 px-4 sm:px-5 pt-8 pb-4 rounded-t-3xl mt-4">
          {/* Zone header */}
          <div className="mb-8 flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
            <div className="flex items-center gap-3">
              <span className="text-base font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
                More from
              </span>
              <img src={levelUpLogo} alt="LevelUp" className="h-28 md:h-36 invert opacity-90 object-contain shrink-0" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />
          </div>

          <div className="space-y-8 sm:space-y-10">
            {/* LevelUp Courses */}
            {communitySessions.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Community Sessions</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Learn & Network with dreamers like you</p>
                </div>
                <ScrollableCardRow>
                  {communitySessions.map((session) => (
                    <div key={session.id} className="snap-start flex-shrink-0 cursor-pointer" onClick={() => handleCardClick(session)}>
                      <LevelUpCourseCard imageUrl={session.thumbnail_url || ''} />
                    </div>
                  ))}
                </ScrollableCardRow>
              </section>
            )}

            {/* Learn from the Best */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Learn from the Best</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Masterclasses by industry leaders</p>
                </div>
              </div>
              <ScrollableCardRow>
                {masterclassCards.map((card) => (
                  <div key={card.name} className="snap-start flex-shrink-0">
                    <MasterclassCard
                      imageUrl={card.image}
                      externalUrl={card.url}
                      name={card.name}
                    />
                  </div>
                ))}
              </ScrollableCardRow>
            </section>

            {/* Explore Programs */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Explore other programs</h2>
                <p className="text-sm text-muted-foreground mt-0.5">From the House of LevelUp Learning</p>
              </div>

              {/* Toggle */}
              <div className="flex gap-1 p-1 rounded-full bg-card border border-border/30 w-fit">
                {(['online', 'offline'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgramTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      programTab === tab
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'online' ? 'Online Programs' : 'Offline Residencies'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {explorePrograms
                  .filter(p => p.program_tab === programTab)
                  .map((p) => (
                    <ProgramBanner
                      key={p.id}
                      label={p.label || undefined}
                      title={p.title}
                      description={p.description || ''}
                      ctaUrl={p.redirect_url || '#'}
                      gradient={p.gradient || 'linear-gradient(135deg, hsl(260,60%,25%) 0%, hsl(230,50%,30%) 100%)'}
                      imageUrl={p.image_url || undefined}
                    />
                  ))}
                {explorePrograms.filter(p => p.program_tab === programTab).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No programs available yet</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Extracted carousel section for course cards */
interface CourseCarouselSectionProps {
  items: (LearnContent & { card_layout?: string })[];
  title: string;
  subtitle?: string;
  sectionType?: string;
  gridLayout?: boolean;
  defaultCardLayout?: 'portrait' | 'landscape';
  defaultThumbnail?: string;
  onCardClick: (item: LearnContent) => void;
  onViewAll: (sectionType: string) => void;
}

const CourseCarouselSection: React.FC<CourseCarouselSectionProps> = ({
  items,
  title,
  subtitle,
  sectionType,
  gridLayout,
  defaultCardLayout,
  defaultThumbnail,
  onCardClick,
  onViewAll,
}) => {
  if (items.length === 0) return null;

  const displayItems = gridLayout ? items.slice(0, 6) : items;
  const showViewAll = gridLayout ? items.length > 6 : items.length > 3;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {showViewAll && sectionType && (
          <button
            onClick={() => onViewAll(sectionType)}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 active:scale-95 tap-feedback"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {gridLayout ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayItems.map((item) => {
            const layout = (item.card_layout as 'portrait' | 'landscape') || defaultCardLayout || 'portrait';
            const thumb = item.thumbnail_url || (defaultThumbnail && layout === 'landscape' ? defaultThumbnail : undefined);
            return (
              <LearnCourseCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnailUrl={thumb}
                durationMinutes={item.duration_minutes}
                category={item.category}
                instructorName={item.instructor_name}
                companyName={item.company_name}
                cardLayout={layout}
                onClick={() => onCardClick(item)}
              />
            );
          })}
        </div>
      ) : (
        <ScrollableCardRow>
          {items.map((item) => {
            const layout = (item.card_layout as 'portrait' | 'landscape') || defaultCardLayout || 'portrait';
            const thumb = item.thumbnail_url || (defaultThumbnail && layout === 'landscape' ? defaultThumbnail : undefined);
            return (
              <div key={item.id} className="snap-start flex-shrink-0">
                <LearnCourseCard
                  id={item.id}
                  title={item.title}
                  thumbnailUrl={thumb}
                  durationMinutes={item.duration_minutes}
                  category={item.category}
                  instructorName={item.instructor_name}
                  companyName={item.company_name}
                  cardLayout={layout}
                  onClick={() => onCardClick(item)}
                />
              </div>
            );
          })}
        </ScrollableCardRow>
      )}
    </section>
  );
};

export default Learn;
