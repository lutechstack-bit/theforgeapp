import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ChevronRight, Sparkles } from 'lucide-react';

export const PerksQuickAccess: React.FC = () => {
  return (
    <Link to="/perks" className="block">
      <div className="relative flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all group overflow-hidden active:scale-[0.98]">
        {/* Decorative sparkle */}
        <div className="absolute top-1 right-12 opacity-30 group-hover:opacity-60 transition-opacity">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:from-primary group-hover:to-primary/80 group-hover:border-transparent transition-all">
          <Gift className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">My Perks & Acceptance</h3>
          <p className="text-xs text-muted-foreground">View your Forge Bag & benefits</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};
