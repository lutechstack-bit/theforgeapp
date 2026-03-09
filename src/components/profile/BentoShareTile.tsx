import React from 'react';
import { BentoTile } from './BentoTile';
import { Globe, Lock, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface BentoShareTileProps {
  isPublic: boolean;
  portfolioUrl: string | null;
  onTogglePublic: (isPublic: boolean) => void;
  onDownloadPDF?: () => void;
  isUpdating?: boolean;
}

export const BentoShareTile: React.FC<BentoShareTileProps> = ({
  isPublic,
  portfolioUrl,
  onTogglePublic,
  onDownloadPDF,
  isUpdating,
}) => {
  return (
    <BentoTile
      label="Share Portfolio"
      icon="⎘"
      className="col-span-full"
      animationDelay={0.40}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-[10px] bg-secondary border border-primary/10 flex items-center justify-center text-base">
            {isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div>
            <div className="text-[13.5px] font-medium text-foreground">
              {isPublic ? 'Portfolio is Public' : 'Portfolio is Private'}
            </div>
            <div className="text-[11.5px] text-muted-foreground mt-0.5">
              {isPublic ? 'Anyone with the link can view your profile' : 'Only you can see your portfolio'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={isPublic}
            onCheckedChange={onTogglePublic}
            disabled={isUpdating}
          />
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-secondary border border-primary/10 rounded-lg text-xs text-muted-foreground hover:border-primary/25 hover:text-foreground transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          )}
        </div>
      </div>
    </BentoTile>
  );
};
