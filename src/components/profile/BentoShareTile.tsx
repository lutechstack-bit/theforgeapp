import React from 'react';
import { BentoTile } from './BentoTile';
import { Globe, Lock, Download, Copy, ExternalLink, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    if (!portfolioUrl) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast({ title: 'Link Copied', description: 'Portfolio link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  return (
    <BentoTile
      label="Share Portfolio"
      icon="⎘"
      className="col-span-full"
      animationDelay={0.40}
    >
      <div className="space-y-4">
        {/* Toggle row */}
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

        {/* Portfolio URL section - shown when public */}
        {isPublic && portfolioUrl && (
          <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-primary/10 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-[10.5px] text-muted-foreground mb-1">Your public portfolio link</p>
              <p className="text-[12.5px] text-foreground font-medium truncate">{portfolioUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[11px] font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-primary/10 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/25 transition-all shrink-0"
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </a>
          </div>
        )}
      </div>
    </BentoTile>
  );
};
