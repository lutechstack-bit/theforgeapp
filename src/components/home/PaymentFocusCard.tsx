import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentDetailModal from './PaymentDetailModal';

interface PaymentConfig {
  programme_total: number;
  deposit_paid: number;
  deposit_label: string;
  balance_due: number;
  payment_deadline: string | null;
  payment_link: string | null;
  installment_link: string | null;
}

const PaymentFocusCard: React.FC = () => {
  const { user, profile, edition } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: paymentConfig, isLoading } = useQuery({
    queryKey: ['my-payment-config', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('payment_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as PaymentConfig | null;
    },
    enabled: !!user?.id && profile?.payment_status === 'CONFIRMED_15K',
    staleTime: 5 * 60 * 1000,
  });

  if (profile?.payment_status !== 'CONFIRMED_15K' || isLoading || !paymentConfig) {
    return null;
  }

  const { balance_due } = paymentConfig;

  const editionLabel = edition
    ? `Forge ${edition.cohort_type === 'FORGE' ? 'Filmmaking' : edition.cohort_type === 'FORGE_WRITING' ? 'Writing' : 'Creators'} - ${edition.city}`
    : 'Programme';
  const editionDates = edition?.forge_start_date && edition?.forge_end_date
    ? `${new Date(edition.forge_start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}-${new Date(edition.forge_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : '';

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/15 px-2.5 py-1 rounded-md">
            Payment Due
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            ₹{balance_due.toLocaleString('en-IN')} remaining
          </span>
        </div>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-3 rounded-xl bg-destructive/15 border border-destructive/20">
            <IndianRupee className="w-6 h-6 text-destructive" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground mb-1">
              Complete your programme fees
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {editionLabel} {editionDates && `· ${editionDates}`}
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              size="sm"
              variant="destructive"
              className="gap-2"
            >
              Pay Balance
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Decorative accent */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
      </div>

      <PaymentDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        config={paymentConfig}
        editionLabel={editionLabel}
        editionDates={editionDates}
      />
    </>
  );
};

export default PaymentFocusCard;
