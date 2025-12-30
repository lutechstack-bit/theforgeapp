import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumCourseCard } from '@/components/shared/PremiumCourseCard';
import { ArrowRight, BookOpen, Users } from 'lucide-react';

const Learn: React.FC = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { isFullAccess } = useAuth();

  // Fetch learn content from database
  const { data: courses, isLoading } = useQuery({
    queryKey: ['learn_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handlePlayCourse = (course: typeof courses[0]) => {
    if (course.is_premium && !isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    // Play video logic here
    console.log('Playing course:', course.title);
  };

  const categories = ['All', ...new Set(courses?.map(c => c.category) || [])];

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
          <p className="text-muted-foreground text-lg">
            Built by Leaders From Amazon, CRED, Zepto, Hindustan Unilever, Flipkart, Paytm & more
          </p>
        </div>

        {/* Tabs for categories */}
        <Tabs defaultValue="All" className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent p-0 h-auto gap-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-card data-[state=inactive]:border data-[state=inactive]:border-border/50"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden md:flex">
              View All Courses
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {courses
                    ?.filter((c) => category === 'All' || c.category === category)
                    .map((course) => (
                      <PremiumCourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        thumbnailUrl={course.thumbnail_url || undefined}
                        instructorName={course.description?.split(' - ')[0] || 'Instructor'}
                        companyName={course.description?.split(' - ')[1]}
                        isPremium={course.is_premium}
                        isLocked={course.is_premium && !isFullAccess}
                        duration={course.duration_minutes ? `${course.duration_minutes} min` : undefined}
                        onClick={() => handlePlayCourse(course)}
                      />
                    ))}
                </div>
              )}

              {!isLoading && courses?.filter((c) => category === 'All' || c.category === category).length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon for new content in this category
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Upcoming Session Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                Live Session
              </span>
              <h3 className="font-bold text-foreground text-xl mb-2">Weekly Community Call</h3>
              <p className="text-muted-foreground mb-4">
                Join fellow creators every Friday at 6 PM IST for discussions, Q&A, and networking. 
                Get access to exclusive insights from industry leaders.
              </p>
              <Button variant="outline" className="rounded-full">
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>

        <UnlockModal
          open={showUnlockModal}
          onOpenChange={setShowUnlockModal}
          title="Unlock Premium Content"
          description="This content is available to fully onboarded members. Complete your balance payment to access all exclusive videos, sessions, and mentorship content."
        />
      </div>
    </div>
  );
};

export default Learn;
