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
      {/* Hero */}
      <CinematicHero
        icon={Gift}
        title={<>Your <span>Perks</span></>}
        subtitle="We partner with the industry's best so you can focus on your craft"
        badge="Exclusive Access"
      />

      {/* Perk Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="aspect-[16/10] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
