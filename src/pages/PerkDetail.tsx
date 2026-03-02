import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PerkClaimForm } from '@/components/perks/PerkClaimForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, Info, ListChecks, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PerkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: perk, isLoading } = useQuery({
    queryKey: ['perk', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perks')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: fields } = useQuery({
    queryKey: ['perk-fields', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perk_form_fields')
        .select('*')
        .eq('perk_id', id!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingClaim } = useQuery({
    queryKey: ['perk-claim', id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perk_claims')
        .select('id')
        .eq('perk_id', id!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="page-container max-w-2xl mx-auto pb-safe">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl mb-6" />
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!perk) {
    return (
      <div className="page-container max-w-2xl mx-auto pb-safe text-center">
        <p className="text-muted-foreground">Perk not found</p>
        <Button variant="outline" onClick={() => navigate('/perks')} className="mt-4">
          Back to Perks
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl mx-auto pb-safe">
      {/* Back Button */}
      <button
        onClick={() => navigate('/perks')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Perks</span>
      </button>

      {/* Banner + Logo */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div
          className="h-32 md:h-40"
          style={{
            background: perk.banner_url
              ? `url(${perk.banner_url}) center/cover`
              : perk.banner_color || 'hsl(var(--primary) / 0.15)',
          }}
        />
        <div className="absolute -bottom-8 left-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-card border-2 border-border/50 shadow-lg flex items-center justify-center p-2.5 overflow-hidden">
            {perk.logo_url ? (
              <img src={perk.logo_url} alt={perk.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{perk.name[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Name + Headline */}
      <div className="mt-10 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">{perk.name}</h1>
        <p className="text-sm md:text-base text-primary font-semibold">{perk.headline}</p>
      </div>

      {/* Info Sections */}
      <div className="space-y-5 mb-8">
        {perk.about && (
          <Section icon={<Info className="h-4 w-4" />} title="About">
            <p className="text-sm text-muted-foreground leading-relaxed">{perk.about}</p>
          </Section>
        )}
        {perk.offer_details && (
          <Section icon={<Tag className="h-4 w-4" />} title="Offer Details">
            <p className="text-sm text-muted-foreground leading-relaxed">{perk.offer_details}</p>
          </Section>
        )}
        {perk.how_to_avail && (
          <Section icon={<ListChecks className="h-4 w-4" />} title="How to Avail">
            <p className="text-sm text-muted-foreground leading-relaxed">{perk.how_to_avail}</p>
          </Section>
        )}
        {perk.notes && (
          <Section icon={<FileText className="h-4 w-4" />} title="Notes">
            <p className="text-sm text-muted-foreground leading-relaxed">{perk.notes}</p>
          </Section>
        )}
      </div>

      {/* Claim Form */}
      {fields && fields.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 md:p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Claim This Perk
          </h2>
          <PerkClaimForm
            perkId={perk.id}
            perkName={perk.name}
            fields={fields}
            existingClaim={existingClaim ?? false}
          />
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="rounded-xl border border-border/50 bg-card p-4 md:p-5">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-primary">{icon}</span>
      <h2 className="font-semibold text-foreground text-sm">{title}</h2>
    </div>
    {children}
  </div>
);

export default PerkDetail;
