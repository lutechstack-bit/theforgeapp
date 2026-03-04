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
        className={`group relative w-full rounded-2xl overflow-hidden border border-border/50 transition-all duration-300 ${
          isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        <img
          src={bannerUrl}
          alt={name}
          className="w-full h-auto block"
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

  // Fallback: text layout
  return (
    <button
      onClick={() => !isComingSoon && navigate(`/perks/${id}`)}
      disabled={isComingSoon}
      className={`group relative w-full text-left rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 ${
        isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]'
      }`}
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-sm md:text-base truncate">{name}</h3>
            {category && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50 text-muted-foreground shrink-0 hidden sm:inline-flex">
                {category}
              </Badge>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{headline}</p>
        </div>
        {isComingSoon && (
          <Badge className="shrink-0 bg-muted text-muted-foreground border-border/50 gap-1">
            <Clock className="h-3 w-3" />
            Soon
          </Badge>
        )}
      </div>
    </button>
  );
};
