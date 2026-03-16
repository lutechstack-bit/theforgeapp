import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface PerkCardProps {
  id: string;
  name: string;
  headline: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  category: string | null;
  isComingSoon: boolean;
}

export const PerkCard: React.FC<PerkCardProps> = ({ id, name, headline, logoUrl, bannerUrl, category, isComingSoon }) => {
  const navigate = useNavigate();

  // Banner image mode
  if (bannerUrl) {
    return (
      <button
        onClick={() => !isComingSoon && navigate(`/perks/${id}`)}
        disabled={isComingSoon}
        className={`group relative w-full h-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#FFBF00]/20 transition-all duration-300 ${
          isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover-gold-glow hover:border-[#FFBF00]/60 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        <img
          src={bannerUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {isComingSoon && (
          <Badge className="absolute top-3 right-3 bg-muted/80 backdrop-blur-sm text-muted-foreground border-border/50 gap-1">
            <Clock className="h-3 w-3" />
            Soon
          </Badge>
        )}
      </button>
    );
  }

  // Coming soon without banner: clean minimal card
  if (isComingSoon) {
    return (
      <div className="w-full aspect-[16/10] rounded-2xl border border-primary/20 bg-card flex flex-col items-center justify-center gap-2 opacity-70">
        <Clock className="h-7 w-7 text-muted-foreground/60" />
        <p className="text-sm font-semibold text-foreground/80">Coming Soon</p>
        <p className="text-xs text-muted-foreground">More perks on the way</p>
      </div>
    );
  }

  // Fallback: text layout (active perk, no banner)
  return (
    <button
      onClick={() => navigate(`/perks/${id}`)}
      className="group relative w-full text-left rounded-2xl border border-primary/20 bg-card overflow-hidden transition-all duration-300 hover-gold-glow hover:border-primary/60 active:scale-[0.98]"
    >
      <div className="p-5 md:p-6 flex items-center gap-4 md:gap-5">
        <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-background/80 border border-border/30 flex items-center justify-center p-2.5 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xl font-bold text-muted-foreground">{name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm md:text-base truncate">{name}</h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{headline}</p>
        </div>
      </div>
    </button>
  );
};
