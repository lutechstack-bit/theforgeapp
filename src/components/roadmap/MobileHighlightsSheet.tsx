import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import RoadmapSidebar from './RoadmapSidebar';

interface MobileHighlightsSheetProps {
  editionId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MobileHighlightsSheet: React.FC<MobileHighlightsSheetProps> = ({ 
  editionId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  // If externally controlled (no trigger), render sheet without trigger
  if (isControlled && !trigger) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl pb-safe">
          <SheetHeader className="pb-4 border-b border-border mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Forge Highlights
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100%-80px)] pb-8 -mx-4 px-4">
            <RoadmapSidebar editionId={editionId} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Highlights
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl pb-safe">
        <SheetHeader className="pb-4 border-b border-border mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Forge Highlights
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100%-80px)] pb-8 -mx-4 px-4">
          <RoadmapSidebar editionId={editionId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileHighlightsSheet;
