import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface PaymentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: {
    programme_total: number;
    deposit_paid: number;
    deposit_label: string;
    balance_due: number;
    payment_deadline: string | null;
    payment_link: string | null;
    installment_link: string | null;
  };
  editionLabel: string;
  editionDates: string;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  open,
  onOpenChange,
  config,
  editionLabel,
  editionDates,
}) => {
  const isMobile = useIsMobile();
  const { programme_total, deposit_paid, deposit_label, balance_due, payment_deadline, payment_link, installment_link } = config;
  const percentPaid = Math.round((deposit_paid / programme_total) * 100);

  const formattedDeadline = payment_deadline
    ? new Date(payment_deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentPaid / 100) * circumference;

  const content = (
    <div className="flex flex-col md:flex-row gap-6 p-1">
      {/* Left Column */}
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Complete your programme fees</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {editionLabel} {editionDates && `· ${editionDates}`}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment progress</span>
            <span className="font-medium text-foreground">{percentPaid}% paid</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Programme total</span>
            <span className="font-medium text-foreground">₹{programme_total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {deposit_label}
            </span>
            <span className="font-medium text-emerald-500">₹{deposit_paid.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">Balance due</span>
            <span className="text-foreground">₹{balance_due.toLocaleString('en-IN')}</span>
          </div>
          {formattedDeadline && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment deadline</span>
              <span className="font-medium text-destructive">{formattedDeadline}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Progress Ring & CTA */}
      <div className="flex flex-col items-center justify-center gap-4 min-w-[180px]">
        <div className="relative w-[140px] h-[140px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="8" className="stroke-secondary" />
            <circle
              cx="60" cy="60" r={radius} fill="none" strokeWidth="8"
              className="stroke-primary"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Balance Due</span>
            <span className="text-lg font-bold text-foreground">₹{balance_due.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {payment_link && (
          <a
            href={payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Pay ₹{balance_due.toLocaleString('en-IN')} now
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {installment_link && (
          <a
            href={installment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Pay in instalments
          </a>
        )}
        {formattedDeadline && (
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            Due {formattedDeadline}
          </span>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Payment Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailModal;
