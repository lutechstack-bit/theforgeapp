 import React, { useState } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { 
   Gift, Sparkles, ShoppingBag, Shirt, PenTool, FileText, Tag, Mail, Video, Mic, Monitor, 
   SlidersHorizontal, Package, Award, Share2, Download, Crown,
   CheckCircle2, Users
 } from 'lucide-react';
 import { CohortType } from '@/contexts/ThemeContext';
 import { AcceptanceShareCard } from '@/components/perks/AcceptanceShareCard';
 import { PartnershipHero } from '@/components/perks/PartnershipHero';
 import forgeIcon from '@/assets/forge-icon.png';
 
 interface BagItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
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
 
 const cohortBagItemsMap: Record<CohortType, BagItem[]> = {
  FORGE: filmBagItems,
  FORGE_WRITING: writersBagItems,
  FORGE_CREATORS: creatorsBagItems,
 };
 
 const cohortTitles: Record<CohortType, string> = {
  FORGE: 'Filmmakers',
  FORGE_WRITING: 'Writing',
  FORGE_CREATORS: 'Creators',
 };
 
 const Perks: React.FC = () => {
  const { profile, edition } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const cohortType: CohortType = edition?.cohort_type || 'FORGE';
  const bagItems = cohortBagItemsMap[cohortType];
  const userName = profile?.full_name || 'Forger';

  const handleShare = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="page-container max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-safe">
      {/* Partnership Hero - Sony & Digitek */}
      <PartnershipHero />

      {/* Acceptance Card */}
      <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl border border-[#FFBF00]/20 bg-card">
        <div className="relative p-4 md:p-6">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Official Acceptance</p>
                <h1 className="text-lg md:text-xl font-bold text-foreground">
                  Welcome, {userName.split(' ')[0]}!
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all h-9 w-9"
                onClick={handleShare}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all h-9 w-9"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Acceptance Letter Preview */}
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-border/50 mb-4">
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              <span className="text-foreground font-medium">Dear {userName},</span>
              <br /><br />
              Congratulations! You've been selected to join <span className="text-primary font-semibold">Forge {cohortTitles[cohortType]}</span> — 
              an exclusive cohort of creators pushing the boundaries of storytelling.
            </p>
          </div>

          {/* Share CTA */}
          <button
            onClick={handleShare}
            className="w-full py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-primary to-deep-gold text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all duration-300 group active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Share Your Acceptance</span>
            <span className="text-primary-foreground/70 text-xs font-normal hidden sm:inline">#ForgeAccepted</span>
          </button>
        </div>
      </div>

      {/* Perks Unlocked Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Perks Unlocked</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Exclusive benefits for Forge alumni</p>
          </div>
        </div>

        {/* Alumni Network Perk */}
        <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl bg-card border border-[#FFBF00]/20 animate-fade-in">
          <Users className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
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
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Your Forge Bag</h2>
            <p className="text-xs md:text-sm text-muted-foreground">{bagItems.length} items included</p>
          </div>
        </div>

         <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
           {bagItems.map((item, index) => (
             <div
               key={item.id}
               className="group relative p-3 md:p-4 rounded-xl bg-card border border-[#FFBF00]/20 animate-fade-in"
               style={{ animationDelay: `${index * 0.05}s` }}
             >
              <div className="flex flex-col gap-2.5">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
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
              <CheckCircle2 className="absolute top-2.5 right-2.5 md:top-3 md:right-3 h-3.5 w-3.5 md:h-4 md:w-4 text-primary/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-5 md:p-6 rounded-xl bg-card border border-[#FFBF00]/20 text-center">
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
