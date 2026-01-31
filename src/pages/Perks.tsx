import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Gift, Sparkles, ShoppingBag, Shirt, PenTool, FileText, Tag, Mail, Video, Mic, Monitor, 
  SlidersHorizontal, Package, Award, Share2, Download, Percent, Crown,
  CheckCircle2, Users, Camera, Lightbulb
} from 'lucide-react';
import { CohortType } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { AcceptanceShareCard } from '@/components/perks/AcceptanceShareCard';

interface BagItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

interface EquipmentDiscount {
  id: string;
  brand: string;
  tagline: string;
  description: string;
  discount: string;
  icon: React.ReactNode;
}

// Filmmakers bag items
const filmBagItems: BagItem[] = [
  { id: 'f1', title: 'Forge Cap', description: 'Exclusive branded cap', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'f2', title: 'Forge Tote Bag', description: 'Premium canvas tote', icon: <ShoppingBag className="h-5 w-5" /> },
  { id: 'f3', title: 'Forge Pencil', description: 'Professional sketching pencil', icon: <PenTool className="h-5 w-5" /> },
  { id: 'f4', title: 'Forge Notepad', description: 'Shot list & ideas notepad', icon: <FileText className="h-5 w-5" /> },
  { id: 'f5', title: 'Forge T-Shirt', description: 'Exclusive crew t-shirt', icon: <Shirt className="h-5 w-5" /> },
  { id: 'f6', title: 'Welcome Letter', description: 'Personalized acceptance letter', icon: <Mail className="h-5 w-5" /> },
  { id: 'f7', title: 'Bag Tag', description: 'Custom Forge bag tag', icon: <Tag className="h-5 w-5" /> },
];

// Writers bag items
const writersBagItems: BagItem[] = [
  { id: 'w1', title: 'Writer\'s Cap', description: 'Exclusive branded cap', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'w2', title: 'Forge Tote Bag', description: 'Premium canvas tote', icon: <ShoppingBag className="h-5 w-5" /> },
  { id: 'w3', title: 'Writer\'s T-Shirt', description: 'Exclusive Forge Writing tee', icon: <Shirt className="h-5 w-5" /> },
  { id: 'w4', title: 'Bag Tag', description: 'Custom Forge bag tag', icon: <Tag className="h-5 w-5" /> },
  { id: 'w5', title: 'Poral Premium Pen', description: 'Premium writing instrument', icon: <PenTool className="h-5 w-5" /> },
];

// Creators bag items
const creatorsBagItems: BagItem[] = [
  { id: 'c1', title: 'Filmm Sami', description: 'Professional filming accessory', icon: <Video className="h-5 w-5" /> },
  { id: 'c2', title: 'Digitek Tripod', description: 'Sturdy tripod for stable shots', icon: <Video className="h-5 w-5" /> },
  { id: 'c3', title: 'Wireless Mic', description: 'Professional wireless microphone', icon: <Mic className="h-5 w-5" /> },
  { id: 'c4', title: 'Digitek Tube Light', description: 'LED tube light for lighting', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'c5', title: 'Monitor', description: 'External monitor for framing', icon: <Monitor className="h-5 w-5" /> },
  { id: 'c6', title: 'Shogun/Lellupet', description: 'Professional recording equipment', icon: <Video className="h-5 w-5" /> },
  { id: 'c7', title: 'Slider (4ft & 6ft)', description: 'Professional camera sliders', icon: <SlidersHorizontal className="h-5 w-5" /> },
];

// Equipment discounts - Sony and Digitek only
const equipmentDiscounts: EquipmentDiscount[] = [
  { 
    id: 'sony', 
    brand: 'Sony', 
    tagline: 'Official Partner',
    description: 'Special pricing on cameras, lenses & professional accessories', 
    discount: 'Up to 25% off',
    icon: <Camera className="h-5 w-5" />,
  },
  { 
    id: 'digitek', 
    brand: 'Digitek', 
    tagline: 'Official Partner',
    description: 'Lighting equipment, tripods & production accessories', 
    discount: 'Up to 30% off',
    icon: <Lightbulb className="h-5 w-5" />,
  },
];

const cohortBagItemsMap: Record<CohortType, BagItem[]> = {
  FORGE: filmBagItems,
  FORGE_WRITING: writersBagItems,
  FORGE_CREATORS: creatorsBagItems,
};

const cohortTitles: Record<CohortType, string> = {
  FORGE: 'Filmmaker',
  FORGE_WRITING: 'Writer',
  FORGE_CREATORS: 'Creator',
};

const Perks: React.FC = () => {
  const { profile, edition } = useAuth();
  const [isShareHovered, setIsShareHovered] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const cohortType: CohortType = edition?.cohort_type || 'FORGE';
  const bagItems = cohortBagItemsMap[cohortType];
  const userName = profile?.full_name || 'Forger';

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleDownloadLetter = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="container py-4 md:py-6 px-4 md:px-6 max-w-4xl pb-safe">
      {/* Hero Section - Acceptance Card */}
      <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-5 md:p-8">
          <div className="flex items-start justify-between mb-5 md:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-primary font-semibold">Official Acceptance</p>
                <h1 className="text-xl md:text-3xl font-black text-foreground">
                  Welcome, {userName.split(' ')[0]}!
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all h-9 w-9 md:h-10 md:w-10"
                onClick={handleDownloadLetter}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all h-9 w-9 md:h-10 md:w-10"
                onMouseEnter={() => setIsShareHovered(true)}
                onMouseLeave={() => setIsShareHovered(false)}
                onClick={handleShare}
              >
                <Share2 className={`h-4 w-4 transition-transform ${isShareHovered ? 'scale-110' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Acceptance Letter Preview */}
          <div className="bg-background/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-border/50 mb-5 md:mb-6">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-foreground font-medium">Dear {userName},</span>
              <br /><br />
              Congratulations! You've been selected to join <span className="text-primary font-semibold">Forge {cohortTitles[cohortType]}</span> — 
              an exclusive cohort of creators pushing the boundaries of storytelling.
              <br /><br />
              Your journey begins with the gear, community, and mentorship that will transform how you create.
            </p>
          </div>

          {/* Share CTA */}
          <button
            onClick={handleShare}
            className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-deep-gold text-primary-foreground font-bold flex items-center justify-center gap-2 md:gap-3 hover:shadow-gold-glow transition-all duration-300 group active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm md:text-base">Share Your Acceptance</span>
            <span className="text-primary-foreground/70 text-xs md:text-sm font-normal hidden sm:inline">#ForgeAccepted</span>
          </button>
        </div>
      </div>

      {/* Equipment Discounts Section - Sony & Digitek */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Percent className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Equipment Discounts</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Exclusive partner pricing</p>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          {equipmentDiscounts.map((item, index) => (
            <div
              key={item.id}
              className="group relative p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-primary/20 hover:border-primary/40 hover:shadow-gold-glow transition-all duration-300 hover:scale-[1.01] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Brand header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-deep-gold group-hover:text-primary-foreground transition-all duration-300 group-hover:border-transparent">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base md:text-lg">{item.brand}</h3>
                    <span className="text-[10px] md:text-xs text-primary uppercase tracking-wider font-medium">{item.tagline}</span>
                  </div>
                </div>
                {/* Discount badge */}
                <span className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-gradient-to-r from-primary to-deep-gold text-primary-foreground text-xs md:text-sm font-bold shadow-lg">
                  {item.discount}
                </span>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm">{item.description}</p>
              
              {/* Checkmark indicator */}
              <CheckCircle2 className="absolute top-3 right-3 md:top-4 md:right-4 h-4 w-4 md:h-5 md:w-5 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Perks Unlocked Section - Only Alumni Network */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Gift className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Perks Unlocked</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Exclusive benefits for Forge alumni</p>
          </div>
        </div>

        {/* Alumni Network Perk */}
        <div className="group flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-card via-card to-secondary/20 border border-primary/20 hover:border-primary/40 hover:shadow-gold-glow transition-all duration-300 hover:scale-[1.01] animate-fade-in">
          <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-deep-gold group-hover:text-primary-foreground transition-all duration-300 border border-primary/10 group-hover:border-transparent shrink-0">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-sm md:text-base">Forge Alumni Network</h3>
              <Crown className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Lifetime access to our exclusive community of creators, mentors & industry professionals</p>
            <a href="/community" className="text-xs text-primary hover:underline mt-1 inline-block">→ Join Community to be linked here</a>
          </div>
          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
        </div>
      </div>

      {/* Forge Bag Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Your Forge Bag</h2>
            <p className="text-xs md:text-sm text-muted-foreground">{bagItems.length} items included</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
          {bagItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative p-3 md:p-4 rounded-xl md:rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-gold-glow transition-all duration-300 hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col gap-2.5">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-deep-gold group-hover:text-primary-foreground transition-all duration-300 border border-primary/10 group-hover:border-transparent">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-xs md:text-sm leading-tight mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="absolute top-2.5 right-2.5 md:top-3 md:right-3 h-3.5 w-3.5 md:h-4 md:w-4 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-5 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-card to-secondary/50 border border-border/50 text-center">
        <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 md:mb-4 border border-primary/20">
          <Package className="h-5 w-5 md:h-7 md:w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">Your Forge Bag Awaits</h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
          All physical items will be handed to you on Day 1 of your Forge experience. 
          Digital perks can be requested by emailing LevelUp.
        </p>
      </div>

      {/* Share Modal */}
      <AcceptanceShareCard
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        userName={userName}
        cohortType={cohortType}
        cohortTitle={cohortTitles[cohortType]}
      />
    </div>
  );
};

export default Perks;
