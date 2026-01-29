import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AcceptanceShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  cohortType: string;
  cohortTitle: string;
}

export const AcceptanceShareCard: React.FC<AcceptanceShareCardProps> = ({
  open,
  onOpenChange,
  userName,
  cohortType,
  cohortTitle,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `forge-acceptance-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Acceptance letter downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

      const file = new File([blob], 'forge-acceptance.png', { type: 'image/png' });
      const shareText = `I got accepted into Forge ${cohortTitle}! 🎬 Excited to begin this journey. #ForgeAccepted`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          text: shareText,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: 'Forge Acceptance',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        // Fallback: copy text and download image
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        handleDownload();
        toast.success('Text copied! Image downloading...');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Failed to share');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-primary/20">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold">Share Your Acceptance</DialogTitle>
        </DialogHeader>

        {/* Shareable Card Preview */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-6 sm:p-8"
            style={{ aspectRatio: '1/1' }}
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-2xl" />
            
            {/* Film strip decoration */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-[#d4af37]/20 via-transparent to-[#d4af37]/20 flex items-center justify-around">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-sm bg-[#1a1a1a]" />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-[#d4af37]/20 via-transparent to-[#d4af37]/20 flex items-center justify-around">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-sm bg-[#1a1a1a]" />
              ))}
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center py-4">
              <div className="mb-4">
                <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
                  Letter of Acceptance
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                FORGE
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-4" />

              <p className="text-[#d4af37]/80 text-sm mb-2">Congratulations</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {userName}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                has been accepted into
              </p>

              <div className="px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
                <span className="text-[#d4af37] font-semibold text-sm">
                  Forge {cohortTitle} • 2026
                </span>
              </div>

              <div className="mt-6 text-[#d4af37]/60 text-xs font-medium">
                #ForgeAccepted
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-primary/30 hover:bg-primary/10"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            onClick={handleShare}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
