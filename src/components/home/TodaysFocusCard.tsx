import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ClipboardList, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FocusCard } from '@/hooks/useTodaysFocus';

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  'clipboard-list': ClipboardList,
  zap: Zap,
  star: Star,
};

interface TodaysFocusCardProps {
  card: FocusCard;
}

const TodaysFocusCard: React.FC<TodaysFocusCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[card.icon_emoji || 'target'] || Target;

  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
    <div className="relative overflow-hidden rounded-[13px] bg-gradient-to-br from-primary/10 via-card to-card p-5">
      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/15 px-2.5 py-1 rounded-md">
          Today's Focus
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          Priority
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-3 rounded-xl bg-primary/15 border border-primary/20">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground mb-1">
            {card.title}
          </h3>
          {card.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {card.description}
            </p>
          )}
          <Button
            onClick={() => navigate(card.cta_route)}
            size="sm"
            className="gap-2 shadow-glow"
          >
            {card.cta_text}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
    </div>
    </div>
  );
};

export default TodaysFocusCard;
