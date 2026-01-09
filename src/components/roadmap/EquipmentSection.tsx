import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Camera, Aperture, Mic, Lightbulb, Video, Code, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const categories = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'lens', label: 'Lenses', icon: Aperture },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'grip', label: 'Grip', icon: Video },
  { id: 'software', label: 'Software', icon: Code },
];

interface EquipmentSectionProps {
  cohortType: string;
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({ cohortType }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['forge-equipment', cohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forge_equipment')
        .select('*')
        .eq('cohort_type', cohortType)
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
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!equipment || equipment.length === 0) {
    return null;
  }

  const featuredItem = equipment.find(e => e.is_featured);
  const filteredEquipment = equipment.filter(e => {
    if (e.is_featured) return false;
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  // Get unique categories from available equipment
  const availableCategories = ['all', ...new Set(equipment.map(e => e.category))];
  const visibleCategories = categories.filter(c => availableCategories.includes(c.id));

  return (
    <section id="roadmap-equipment" className="py-8">
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

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 gap-2 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Featured Hero Card */}
      {featuredItem && activeCategory === 'all' && (
        <EquipmentHeroCard equipment={featuredItem} />
      )}

      {/* Equipment Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <EquipmentCard key={item.id} equipment={item} />
        ))}
      </div>

      {filteredEquipment.length === 0 && activeCategory !== 'all' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No equipment in this category yet.</p>
        </div>
      )}
    </section>
  );
};

export default EquipmentSection;
