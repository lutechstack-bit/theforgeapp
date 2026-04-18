import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFeatureFlags() {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_feature_flags')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isFeatureEnabled = (key: string) => {
    const flag = flags.find(f => f.feature_key === key);
    return flag ? flag.is_enabled : true; // default to enabled if not found
  };

  const toggleFeature = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      // Use upsert (not update) so the first toggle for a flag that was never
      // seeded in app_feature_flags creates the row instead of silently
      // affecting zero rows. onConflict targets the unique feature_key column.
      const { error } = await supabase
        .from('app_feature_flags')
        .upsert(
          { feature_key: key, is_enabled: enabled, updated_at: new Date().toISOString() },
          { onConflict: 'feature_key' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  return { flags, isLoading, isFeatureEnabled, toggleFeature };
}
