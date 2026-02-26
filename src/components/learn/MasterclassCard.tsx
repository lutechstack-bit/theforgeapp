import React, { useState } from 'react';
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
  const [loaded, setLoaded] = useState(false);

  const handleClick = () => {
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-[200px] sm:w-[220px] flex-shrink-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
    <div
      className="rounded-[13px] overflow-hidden cursor-pointer group bg-card"
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
      <div className="p-2.5">
        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-primary to-[hsl(36,88%,44%)] text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]">
          Start Learning
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
    </div>
  );
};
