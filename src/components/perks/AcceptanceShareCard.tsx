import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
 import { Download, Check, Loader2, Linkedin, Facebook } from 'lucide-react';
import { toast } from 'sonner';

 // Custom SVG icons for platforms without lucide icons
 const InstagramIcon = () => (
   <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
   </svg>
 );
 
 const WhatsAppIcon = () => (
   <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
   </svg>
 );
 
 const XIcon = () => (
   <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
   </svg>
 );
 
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

   const shareText = `I got accepted into Forge ${cohortTitle}! 🎬 Excited to begin this journey. #ForgeAccepted`;
   const shareUrl = window.location.origin;
 
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

   const handleInstagram = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

       // Download the image
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.download = `forge-acceptance-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
       link.href = url;
       link.click();
       URL.revokeObjectURL(url);
       
       // Copy caption to clipboard
       await navigator.clipboard.writeText(shareText);
       setCopied(true);
       setTimeout(() => setCopied(false), 3000);
       toast.success('Image downloaded! Caption copied - open Instagram to share');
     } catch (error) {
       console.error('Instagram share error:', error);
       toast.error('Failed to prepare for Instagram');
     } finally {
       setIsGenerating(false);
     }
   };
 
   const handleLinkedIn = () => {
     const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
     window.open(linkedInUrl, '_blank', 'width=600,height=600');
   };
 
   const handleWhatsApp = () => {
     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
     window.open(whatsappUrl, '_blank');
   };
 
   const handleTwitter = () => {
     const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
     window.open(twitterUrl, '_blank', 'width=600,height=400');
   };
 
   const handleFacebook = () => {
     const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
     window.open(facebookUrl, '_blank', 'width=600,height=600');
   };
 
   const handleCopyLink = async () => {
     try {
       await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
       toast.success('Link copied to clipboard!');
     } catch (error) {
       toast.error('Failed to copy');
     }
   };
 
   const socialButtons = [
     {
       name: 'Instagram',
       icon: <InstagramIcon />,
       onClick: handleInstagram,
       className: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90',
     },
     {
       name: 'LinkedIn',
       icon: <Linkedin className="h-5 w-5" />,
       onClick: handleLinkedIn,
       className: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90',
     },
     {
       name: 'WhatsApp',
       icon: <WhatsAppIcon />,
       onClick: handleWhatsApp,
       className: 'bg-[#25D366] hover:bg-[#25D366]/90',
     },
     {
       name: 'X',
       icon: <XIcon />,
       onClick: handleTwitter,
       className: 'bg-black border border-white/20 hover:bg-white/10',
     },
     {
       name: 'Facebook',
       icon: <Facebook className="h-5 w-5" />,
       onClick: handleFacebook,
       className: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
      }
   ];

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

         {/* Social Platform Buttons */}
         <div className="p-4 pt-0">
           <p className="text-xs text-muted-foreground mb-3 text-center">Share to</p>
           <div className="flex justify-center gap-2 mb-4">
             {socialButtons.map((button) => (
               <button
                 key={button.name}
                 onClick={button.onClick}
                 disabled={isGenerating}
                 className={`h-11 w-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${button.className}`}
                 title={button.name}
               >
                 {button.icon}
               </button>
             ))}
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
             onClick={handleCopyLink}
            disabled={isGenerating}
          >
             {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
               <Download className="h-4 w-4 mr-2" />
            )}
             {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
