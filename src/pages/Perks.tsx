import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Gift, Sparkles, ShoppingBag, Shirt, PenTool, FileText, Tag, Mail, Video, Mic, Monitor, 
  SlidersHorizontal, Package, Award, Share2, Download, ExternalLink, Percent, Zap, Crown,
  CheckCircle2, Star
} from 'lucide-react';
import { CohortType } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface BagItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

interface Perk {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'discount' | 'access' | 'tool';
  value?: string;
}

interface Partner {
  id: string;
  name: string;
  logo?: string;
  status: 'active' | 'coming_soon';
  description: string;
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

// Unlocked perks
const unlockedPerks: Perk[] = [
  { id: 'p1', title: 'Forge Alumni Network', description: 'Lifetime access to exclusive community', icon: <Crown className="h-5 w-5" />, type: 'access' },
  { id: 'p2', title: 'Equipment Discounts', description: 'Special pricing on gear rentals', icon: <Percent className="h-5 w-5" />, type: 'discount', value: 'Up to 30% off' },
  { id: 'p3', title: 'Masterclass Library', description: 'Access to all past sessions', icon: <Video className="h-5 w-5" />, type: 'access' },
  { id: 'p4', title: 'Priority Event Access', description: 'First dibs on workshops & events', icon: <Zap className="h-5 w-5" />, type: 'access' },
  { id: 'p5', title: 'Software Deals', description: 'Exclusive software licensing', icon: <Star className="h-5 w-5" />, type: 'tool', value: 'Partner pricing' },
];

// Partners
const partners: Partner[] = [
  { id: 'sony', name: 'Sony', status: 'coming_soon', description: 'Camera & lens discounts' },
  { id: 'digitek', name: 'Digitek', status: 'coming_soon', description: 'Lighting & accessories' },
  { id: 'blackmagic', name: 'Blackmagic', status: 'coming_soon', description: 'Software & hardware deals' },
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
  
  const cohortType: CohortType = edition?.cohort_type || 'FORGE';
  const bagItems = cohortBagItemsMap[cohortType];
  const userName = profile?.full_name || 'Forger';

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'I got accepted into Forge!',
          text: `I've been accepted into Forge - India's most elite filmmaking cohort. Excited to start this journey! 🎬`,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(
          `I've been accepted into Forge - India's most elite filmmaking cohort. Excited to start this journey! 🎬 ${window.location.origin}`
        );
        toast.success('Copied to clipboard! Share your achievement.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadLetter = () => {
    toast.success('Your acceptance letter will be available for download soon!');
  };

  return (
    <div className="container py-6 max-w-4xl">
      {/* Hero Section - Acceptance Card */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold">Official Acceptance</p>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">
                  Welcome to Forge, {userName.split(' ')[0]}!
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10"
                onClick={handleDownloadLetter}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10"
                onMouseEnter={() => setIsShareHovered(true)}
                onMouseLeave={() => setIsShareHovered(false)}
                onClick={handleShare}
              >
                <Share2 className={`h-4 w-4 transition-transform ${isShareHovered ? 'scale-110' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Acceptance Letter Preview */}
          <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-5 border border-border/50 mb-6">
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold flex items-center justify-center gap-3 hover:shadow-glow transition-all group"
          >
            <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Share Your Acceptance
            <span className="text-primary-foreground/70 text-sm font-normal">#ForgeAccepted</span>
          </button>
        </div>
      </div>

      {/* Forge Bag Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Your Forge Bag</h2>
            <p className="text-sm text-muted-foreground">{bagItems.length} items included</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {bagItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked Perks Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Perks Unlocked</h2>
            <p className="text-sm text-muted-foreground">Exclusive benefits for Forge alumni</p>
          </div>
        </div>

        <div className="space-y-3">
          {unlockedPerks.map((perk, index) => (
            <div
              key={perk.id}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                perk.type === 'discount' ? 'bg-green-500/10 text-green-500' :
                perk.type === 'tool' ? 'bg-blue-500/10 text-blue-500' :
                'bg-primary/10 text-primary'
              }`}>
                {perk.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground">{perk.title}</h3>
                  {perk.value && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {perk.value}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{perk.description}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Partners Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ExternalLink className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Partner Benefits</h2>
            <p className="text-sm text-muted-foreground">Exclusive deals from our partners</p>
          </div>
        </div>

        <div className="grid gap-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${
                partner.status === 'active' 
                  ? 'bg-card border-border/50' 
                  : 'bg-card/50 border-border/30'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-muted-foreground">{partner.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                  {partner.status === 'coming_soon' && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Partner benefits are being finalized. Sony, Digitek & more partnerships will be announced soon!
        </p>
      </div>

      {/* Footer Note */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Package className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Your Forge Bag Awaits</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          All physical items will be handed to you on Day 1 of your Forge experience. 
          Digital perks are unlocked immediately upon enrollment completion.
        </p>
      </div>
    </div>
  );
};

export default Perks;
