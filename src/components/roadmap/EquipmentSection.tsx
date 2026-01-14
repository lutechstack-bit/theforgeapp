import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Loader2 } from 'lucide-react';
import EquipmentHeroCard from './EquipmentHeroCard';
import EquipmentCard from './EquipmentCard';

interface EquipmentItem {
  id: string;
  cohort_type: string;
  category: string;
  brand: string;
  name: string;
  model: string | null;
  description: string | null;
  specs: string[];
  image_url: string | null;
  is_featured: boolean;
  order_index: number;
}

interface EquipmentSectionProps {
  cohortType: string;
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({ cohortType }) => {
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['forge-equipment', cohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forge_equipment')
        .select('*')
        .eq('cohort_type', cohortType)
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        specs: Array.isArray(item.specs) ? item.specs as string[] : []
      })) as EquipmentItem[];
    }
  });

  if (isLoading) {
    return (
      <section id="roadmap-equipment" className="py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!equipment || equipment.length === 0) {
    return (
      <section id="roadmap-equipment" className="py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Your Filmmaking Arsenal</h2>
            <p className="text-sm text-muted-foreground">Professional gear at your fingertips</p>
          </div>
        </div>
        <div className="glass-premium rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Equipment list coming soon!</p>
        </div>
      </section>
    );
  }

  const featuredItem = equipment.find(e => e.is_featured);
  const otherEquipment = equipment.filter(e => !e.is_featured);

  return (
    <section id="roadmap-equipment" className="py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Filmmaking Arsenal</h2>
          <p className="text-sm text-muted-foreground">Professional gear at your fingertips</p>
        </div>
      </div>

      {/* Featured Hero Card */}
      {featuredItem && (
        <EquipmentHeroCard equipment={featuredItem} />
      )}

      {/* Equipment Grid - Clean responsive grid */}
      {otherEquipment.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {otherEquipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default EquipmentSection;
