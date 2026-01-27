import React, { useState } from 'react';
import MobileHighlightsSheet from './MobileHighlightsSheet';
import forgeIcon from '@/assets/forge-icon.png';

interface FloatingHighlightsButtonProps {
  editionId?: string;
}

const FloatingHighlightsButton: React.FC<FloatingHighlightsButtonProps> = ({ editionId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 lg:hidden group"
        aria-label="View Forge Highlights"
      >
        {/* Animated glow rings */}
        <div className="absolute inset-0 -m-3 rounded-full bg-primary/15 animate-ping opacity-75" />
        <div className="absolute inset-0 -m-1.5 rounded-full bg-primary/25 animate-pulse" />
        
        {/* Glass button body */}
        <div className="relative p-3 rounded-full 
                        bg-background/80 backdrop-blur-xl 
                        border border-primary/40 
                        shadow-lg shadow-primary/30
                        group-active:scale-95 transition-all duration-200
                        group-hover:border-primary/60 group-hover:shadow-xl">
          <img 
            src={forgeIcon} 
            alt="" 
            className="w-7 h-7 object-contain drop-shadow-[0_0_6px_hsl(var(--primary))]" 
          />
        </div>
        
        {/* "View" label */}
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                         text-[9px] font-bold uppercase tracking-wide
                         text-primary bg-background/95 
                         px-1.5 py-0.5 rounded-full 
                         border border-primary/30 shadow-sm
                         whitespace-nowrap">
          View
        </span>
      </button>

      <MobileHighlightsSheet
        editionId={editionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};

export default FloatingHighlightsButton;
