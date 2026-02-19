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
  { id: 'bfp_sessions', label: 'Pre Forge Sessions' },
  { id: 'community_sessions', label: 'Community Sessions' },
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

  const handleCardClick = (content: LearnContent) => {
    navigate(`/learn/${content.id}`);
  };

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
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[16/10] rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground">
              {activeFilter === 'all' 
                ? 'Check back soon for new content'
                : 'No courses in this category yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <LearnCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                thumbnailUrl={course.thumbnail_url}
                durationMinutes={course.duration_minutes}
                cardLayout="landscape"
                onClick={() => handleCardClick(course)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AllCourses;
