import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MasterclassCardProps {
  imageUrl: string;
  externalUrl: string;
  name: string;
}

export const MasterclassCard: React.FC<MasterclassCardProps> = ({
  imageUrl,
  externalUrl,
  name,
}) => {
  const handleClick = () => {
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="w-[200px] sm:w-[220px] flex-shrink-0 rounded-2xl overflow-hidden border border-border/30 hover:border-primary/40 transition-all duration-300 cursor-pointer group bg-card"
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="p-2.5">
        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-primary to-[hsl(36,88%,44%)] text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]">
          Start Learning
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
