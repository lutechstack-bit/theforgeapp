import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, ShoppingBag, Shirt, PenTool, FileText, Tag, Mail, Video, Mic, Monitor, SlidersHorizontal } from 'lucide-react';
import { CohortType } from '@/contexts/ThemeContext';

interface Perk {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Filmmakers perks
const filmPerks: Perk[] = [
  { id: 'f1', title: 'Forge Cap', description: 'Exclusive branded cap for filmmakers', icon: <Sparkles className="h-6 w-6 text-primary" /> },
  { id: 'f2', title: 'Tote Bag', description: 'Premium tote bag for your gear', icon: <ShoppingBag className="h-6 w-6 text-primary" /> },
  { id: 'f3', title: 'Pencil', description: 'Professional sketching pencil', icon: <PenTool className="h-6 w-6 text-primary" /> },
  { id: 'f4', title: 'Notepad', description: 'Filmmaker\'s notepad for ideas', icon: <FileText className="h-6 w-6 text-primary" /> },
  { id: 'f5', title: 'Forge T-Shirt', description: 'Exclusive Forge branded t-shirt', icon: <Shirt className="h-6 w-6 text-primary" /> },
  { id: 'f6', title: 'Welcome Letter', description: 'Personalized welcome letter', icon: <Mail className="h-6 w-6 text-primary" /> },
  { id: 'f7', title: 'Bag Tag', description: 'Custom Forge bag tag', icon: <Tag className="h-6 w-6 text-primary" /> },
];

// Writers perks
const writersPerks: Perk[] = [
  { id: 'w1', title: 'Writer\'s Cap', description: 'Exclusive branded cap for writers', icon: <Sparkles className="h-6 w-6 text-primary" /> },
  { id: 'w2', title: 'Tote Bag', description: 'Premium tote bag for your notebooks', icon: <ShoppingBag className="h-6 w-6 text-primary" /> },
  { id: 'w3', title: 'Writer\'s T-Shirt', description: 'Exclusive Forge Writing t-shirt', icon: <Shirt className="h-6 w-6 text-primary" /> },
  { id: 'w4', title: 'Bag Tag', description: 'Custom Forge bag tag', icon: <Tag className="h-6 w-6 text-primary" /> },
  { id: 'w5', title: 'Premium Pen', description: 'Poral premium writing pen', icon: <PenTool className="h-6 w-6 text-primary" /> },
];

// Creators perks
const creatorsPerks: Perk[] = [
  { id: 'c1', title: 'Filmm Sami', description: 'Professional filming accessory', icon: <Video className="h-6 w-6 text-primary" /> },
  { id: 'c2', title: 'Digitek Tripod', description: 'Sturdy tripod for stable shots', icon: <Video className="h-6 w-6 text-primary" /> },
  { id: 'c3', title: 'Wireless Mic', description: 'Professional wireless microphone', icon: <Mic className="h-6 w-6 text-primary" /> },
  { id: 'c4', title: 'Digitek Tube Light', description: 'LED tube light for perfect lighting', icon: <Sparkles className="h-6 w-6 text-primary" /> },
  { id: 'c5', title: 'Monitor', description: 'External monitor for precise framing', icon: <Monitor className="h-6 w-6 text-primary" /> },
  { id: 'c6', title: 'Shogun/Lellupet', description: 'Professional recording equipment', icon: <Video className="h-6 w-6 text-primary" /> },
  { id: 'c7', title: 'Slider (4ft & 6ft)', description: 'Professional camera sliders', icon: <SlidersHorizontal className="h-6 w-6 text-primary" /> },
];

const cohortPerksMap: Record<CohortType, Perk[]> = {
  FORGE: filmPerks,
  FORGE_WRITING: writersPerks,
  FORGE_CREATORS: creatorsPerks,
};

const cohortTitles: Record<CohortType, string> = {
  FORGE: 'Filmmaker Perks',
  FORGE_WRITING: 'Writer Perks',
  FORGE_CREATORS: 'Creator Perks',
};

const Perks: React.FC = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { isFullAccess, edition } = useAuth();
  
  const cohortType: CohortType = edition?.cohort_type || 'FORGE';
  const perks = cohortPerksMap[cohortType];

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{cohortTitles[cohortType]}</h1>
        <p className="text-muted-foreground">Exclusive goodies included with your Forge experience</p>
      </div>

      {/* Value Banner */}
      <div className="mb-6 p-5 rounded-2xl gradient-primary shadow-glow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <Gift className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Your Forge Kit</p>
            <p className="text-2xl font-bold text-primary-foreground">{perks.length} Items Included</p>
          </div>
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {perks.map((perk, index) => (
          <div
            key={perk.id}
            className="group relative p-5 rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {perk.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {perk.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {perk.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Gift className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Your Kit Awaits</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          All these items will be provided to you during the Forge experience. Get ready to receive your exclusive gear!
        </p>
      </div>

      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        title="Unlock Perks Access"
        description="All perks become available once you're fully onboarded for Forge. Complete your balance payment to access exclusive benefits."
      />
    </div>
  );
};

export default Perks;
