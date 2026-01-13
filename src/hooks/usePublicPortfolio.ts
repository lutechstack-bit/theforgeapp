import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateUniqueSlug } from '@/lib/slugUtils';

export interface PublicPortfolio {
  id: string;
  user_id: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const usePublicPortfolio = (userId?: string) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: portfolio, isLoading, error, refetch } = useQuery({
    queryKey: ['public-portfolio', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('public_portfolios')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return data as PublicPortfolio | null;
    },
    enabled: !!targetUserId,
  });

  const createOrUpdatePortfolio = useMutation({
    mutationFn: async ({ isPublic }: { isPublic: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if portfolio exists
      const { data: existing } = await supabase
        .from('public_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('public_portfolios')
          .update({ is_public: isPublic })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new with auto-generated slug
        const slug = generateUniqueSlug(profile?.full_name || 'creator');
        
        const { data, error } = await supabase
          .from('public_portfolios')
          .insert({
            user_id: user.id,
            slug,
            is_public: isPublic,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-portfolio', targetUserId] });
      toast({
        title: data.is_public ? 'Portfolio Published' : 'Portfolio Hidden',
        description: data.is_public 
          ? 'Your portfolio is now publicly accessible.' 
          : 'Your portfolio is now private.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update portfolio settings.',
        variant: 'destructive',
      });
      console.error('Portfolio update error:', error);
    },
  });

  const getPortfolioUrl = () => {
    if (!portfolio?.slug) return null;
    return `${window.location.origin}/portfolio/${portfolio.slug}`;
  };

  return {
    portfolio,
    isLoading,
    error,
    refetch,
    createOrUpdatePortfolio,
    getPortfolioUrl,
    isPublic: portfolio?.is_public || false,
  };
};

// Hook for fetching portfolio by slug (for public view)
export const usePortfolioBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['portfolio-by-slug', slug],
    queryFn: async () => {
      const { data: portfolio, error: portfolioError } = await supabase
        .from('public_portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .maybeSingle();

      if (portfolioError) throw portfolioError;
      if (!portfolio) return null;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, editions(*)')
        .eq('id', portfolio.user_id)
        .single();

      // Fetch works
      const { data: works } = await supabase
        .from('user_works')
        .select('*')
        .eq('user_id', portfolio.user_id)
        .order('order_index', { ascending: true });

      // Fetch KY response based on cohort type
      let kyResponse = null;
      const cohortType = profile?.editions?.cohort_type;
      
      if (cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS') {
        const { data } = await supabase
          .from('kyf_responses')
          .select('*')
          .eq('user_id', portfolio.user_id)
          .maybeSingle();
        kyResponse = data;
      } else if (cohortType === 'FORGE_WRITING') {
        const { data } = await supabase
          .from('kyw_responses')
          .select('*')
          .eq('user_id', portfolio.user_id)
          .maybeSingle();
        kyResponse = data;
      }

      return {
        portfolio,
        profile,
        works: works || [],
        kyResponse,
        cohortType,
      };
    },
    enabled: !!slug,
  });
};
