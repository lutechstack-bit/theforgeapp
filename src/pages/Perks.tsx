import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { Button } from '@/components/ui/button';
import { Gift, ExternalLink, Sparkles } from 'lucide-react';

interface Perk {
  id: string;
  title: string;
  description: string;
  partner: string;
  partnerLogo?: string;
  value: string;
}

const mockPerks: Perk[] = [
  {
    id: '1',
    title: 'Pro Editing Software',
    description: '3 months free access to professional editing tools',
    partner: 'EditPro',
    value: '₹6,000',
  },
  {
    id: '2',
    title: 'Cloud Storage',
    description: '1TB cloud storage for your creative projects',
    partner: 'CloudVault',
    value: '₹3,000',
  },
  {
    id: '3',
    title: 'Online Courses',
    description: 'Access to 50+ premium courses on creative skills',
    partner: 'SkillUp',
    value: '₹15,000',
  },
  {
    id: '4',
    title: 'Equipment Rental',
    description: '20% off on all camera and gear rentals',
    partner: 'GearHub',
    value: 'Ongoing',
  },
  {
    id: '5',
    title: 'Coworking Access',
    description: 'Free day passes at partner coworking spaces',
    partner: 'CreativeSpace',
    value: '₹5,000',
  },
  {
    id: '6',
    title: 'Portfolio Website',
    description: 'Free premium portfolio template and hosting',
    partner: 'Folio',
    value: '₹8,000',
  },
];

const Perks: React.FC = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { isFullAccess } = useAuth();

  const handleClaimPerk = (perk: Perk) => {
    if (!isFullAccess) {
      setShowUnlockModal(true);
      return;
    }
    // Claim perk logic
    console.log('Claiming perk:', perk.title);
  };

  const totalValue = mockPerks.reduce((acc, perk) => {
    const value = parseInt(perk.value.replace(/[^0-9]/g, '')) || 0;
    return acc + value;
  }, 0);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Perks</h1>
        <p className="text-muted-foreground">Exclusive benefits for LevelUp members</p>
      </div>

      {/* Value Banner */}
      <div className="mb-6 p-5 rounded-2xl gradient-primary shadow-glow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
            <Gift className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Total Perks Value</p>
            <p className="text-3xl font-bold text-primary-foreground">₹{totalValue.toLocaleString()}+</p>
          </div>
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockPerks.map((perk, index) => (
          <div
            key={perk.id}
            className="group relative p-5 rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {perk.partnerLogo ? (
                  <img src={perk.partnerLogo} alt={perk.partner} className="w-8 h-8 object-contain" />
                ) : (
                  <Sparkles className="h-6 w-6 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">{perk.partner}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {perk.value}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {perk.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {perk.description}
                </p>
                
                <Button
                  variant={isFullAccess ? 'premium' : 'outline'}
                  size="sm"
                  onClick={() => handleClaimPerk(perk)}
                  className="group/btn"
                >
                  {isFullAccess ? 'Claim Perk' : 'Unlock to Claim'}
                  <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* More Coming */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Gift className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">More Perks Coming</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We're constantly partnering with amazing brands to bring you more exclusive benefits. Stay tuned!
        </p>
      </div>

      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        title="Unlock Perks Access"
        description="All perks become claimable once you're fully onboarded for Forge. Complete your balance payment to start claiming exclusive partner benefits."
      />
    </div>
  );
};

export default Perks;
