import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PerkCard } from '@/components/perks/PerkCard';
import { Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Perks: React.FC = () => {
  const { data: perks, isLoading } = useQuery({
    queryKey: ['perks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perks')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="page-container max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Perks</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Exclusive partner discounts for Forge alumni</p>
        </div>
      </div>

      {/* Perk Cards Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {perks?.map(perk => (
            <PerkCard
              key={perk.id}
              id={perk.id}
              name={perk.name}
              headline={perk.headline}
              logoUrl={perk.logo_url}
              bannerUrl={perk.banner_url}
              category={perk.category}
              isComingSoon={perk.is_coming_soon ?? false}
            />
          ))}
        </div>
      )}

      {!isLoading && (!perks || perks.length === 0) && (
        <div className="text-center py-12">
          <Gift className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No perks available yet</p>
        </div>
      )}
    </div>
  );
};

export default Perks;
