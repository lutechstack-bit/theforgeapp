import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

interface UnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  paymentLink?: string;
  onPayClick?: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  open,
  onOpenChange,
  title = "Unlock the Full Experience",
  description = "Complete your balance payment to access exclusive Pre Forge sessions, masterclasses, and premium content from industry experts.",
  paymentLink,
  onPayClick,
}) => {
  const handlePayClick = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
    onPayClick?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-soft">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Balance Due</span>
              <span className="text-lg font-bold text-foreground">₹10,000</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your initial payment of ₹15,000 has been confirmed
            </p>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground font-medium mb-1">
              🎬 What you'll unlock:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Pre Forge Sessions & Masterclasses</li>
              <li>• Premium workshops from industry experts</li>
              <li>• Exclusive resources & downloadables</li>
            </ul>
          </div>

          <Button 
            variant="premium" 
            size="lg" 
            className="w-full"
            onClick={handlePayClick}
          >
            Pay Balance to Unlock
            {paymentLink ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment via Razorpay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};