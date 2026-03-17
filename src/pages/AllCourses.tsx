import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearnContent {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  is_premium: boolean;
  duration_minutes?: number;
  section_type: string;
  category: string;
  order_index: number;
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'bfp_sessions', label: 'Pre Forge' },
  { id: 'community_sessions', label: 'Community' },
];

const AllCourses: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialSection);

  // Fetch all courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['learn_content_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return (data || []) as LearnContent[];
    },
  });

  // Filter courses based on active filter
  const filteredCourses = activeFilter === 'all'
    ? courses
    : courses.filter(c => c.section_type === activeFilter);

  const communityCourses = courses.filter(c => c.section_type === 'community_sessions');
  const preForgeCourses = courses.filter(c => c.section_type === 'bfp_sessions');

  const handleCardClick = (content: LearnContent) => {
    navigate(`/learn/${content.id}`);
  };

  const renderGrid = (items: LearnContent[], layout: 'portrait' | 'landscape' = 'portrait') => (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {items.map((course) => (
        <LearnCourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          thumbnailUrl={course.thumbnail_url}
          durationMinutes={course.duration_minutes}
          cardLayout={layout}
          onClick={() => handleCardClick(course)}
        />
      ))}
    </div>
  );

  const renderSectionHeader = (label: string) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 rounded-full bg-primary" />
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">{label}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">All Courses</h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "w-full min-w-0 px-2 py-2 rounded-full text-xs font-medium leading-tight text-center transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : activeFilter === 'all' ? (
          <div className="space-y-8">
            {communityCourses.length > 0 && (
              <div>
                {renderSectionHeader('Community Sessions')}
                {renderGrid(communityCourses, 'portrait')}
              </div>
            )}
            {preForgeCourses.length > 0 && (
              <div>
                {renderSectionHeader('Pre Forge Sessions')}
                {renderGrid(preForgeCourses, 'landscape')}
              </div>
            )}
            {communityCourses.length === 0 && preForgeCourses.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground">Check back soon for new content</p>
              </div>
            )}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">No courses in this category yet</p>
          </div>
        ) : (
          renderGrid(filteredCourses, activeFilter === 'community_sessions' ? 'portrait' : 'landscape')
        )}
      </div>

    </div>
  );
};

export default AllCourses;
