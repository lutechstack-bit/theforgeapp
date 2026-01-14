import React from 'react';
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
}

const MobileHighlightsSheet: React.FC<MobileHighlightsSheetProps> = ({ 
  editionId,
  trigger 
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Highlights
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Forge Highlights
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full pb-8">
          <RoadmapSidebar editionId={editionId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileHighlightsSheet;
