import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import MobileHighlightsSheet from './MobileHighlightsSheet';

interface FloatingHighlightsButtonProps {
  editionId?: string;
}

const FloatingHighlightsButton: React.FC<FloatingHighlightsButtonProps> = ({ editionId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button - above bottom nav, only on mobile/tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-24 right-4 z-40 lg:hidden
          p-4 rounded-full
          bg-gradient-to-br from-primary to-primary/80
          shadow-lg shadow-primary/30
          animate-pulse
          active:scale-95 transition-transform
          hover:shadow-xl hover:shadow-primary/40
        "
        aria-label="View Forge Highlights"
      >
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </button>

      {/* Bottom sheet with sidebar content */}
      <MobileHighlightsSheet
        editionId={editionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};

export default FloatingHighlightsButton;
