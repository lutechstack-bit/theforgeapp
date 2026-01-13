import React from 'react';
import { Copy, Download, ExternalLink, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface SharePortfolioProps {
  isPublic: boolean;
  portfolioUrl: string | null;
  isOwner?: boolean;
  onTogglePublic: (isPublic: boolean) => void;
  onDownloadPDF?: () => void;
  isUpdating?: boolean;
}

export const SharePortfolio: React.FC<SharePortfolioProps> = ({
  isPublic,
  portfolioUrl,
  isOwner = false,
  onTogglePublic,
  onDownloadPDF,
  isUpdating = false,
}) => {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    if (portfolioUrl) {
      await navigator.clipboard.writeText(portfolioUrl);
      toast({
        title: 'Link Copied',
        description: 'Portfolio link copied to clipboard.',
      });
    }
  };

  const handleOpenLink = () => {
    if (portfolioUrl) {
      window.open(portfolioUrl, '_blank');
    }
  };

  if (!isOwner) return null;

  return (
    <div className="glass-card rounded-xl p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">Share Portfolio</h2>

      {/* Public Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 mb-4">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Globe className="h-5 w-5 text-primary" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium text-foreground">
              {isPublic ? 'Portfolio is Public' : 'Portfolio is Private'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isPublic 
                ? 'Anyone with the link can view your profile' 
                : 'Only you can see your portfolio'}
            </div>
          </div>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={onTogglePublic}
          disabled={isUpdating}
        />
      </div>

      {/* Share Actions */}
      {isPublic && portfolioUrl && (
        <div className="space-y-3">
          {/* URL Display */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/30">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground truncate flex-1">
              {portfolioUrl}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleOpenLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      )}

      {/* Download PDF */}
      {onDownloadPDF && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Portfolio
          </Button>
        </div>
      )}
    </div>
  );
};
