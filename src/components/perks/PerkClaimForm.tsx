import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { z } from 'zod';

interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  is_required: boolean;
  order_index: number;
}

interface PerkClaimFormProps {
  perkId: string;
  perkName: string;
  fields: FormField[];
  existingClaim: boolean;
}

export const PerkClaimForm: React.FC<PerkClaimFormProps> = ({ perkId, perkName, fields, existingClaim }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(existingClaim);

  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    for (const field of fields) {
      if (field.is_required) {
        const val = formData[field.label]?.trim();
        if (!val) {
          toast.error(`Please fill in "${field.label}"`);
          return;
        }
        if (field.field_type === 'email') {
          const emailSchema = z.string().email();
          if (!emailSchema.safeParse(val).success) {
            toast.error('Please enter a valid email address');
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('perk_claims').insert({
        perk_id: perkId,
        user_id: user.id,
        form_data: formData,
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success('Claim submitted successfully! Our team will reach out shortly.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-foreground mb-1">Claim Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          You've already submitted a claim for {perkName}. Our team will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields
        .sort((a, b) => a.order_index - b.order_index)
        .map(field => (
          <div key={field.id}>
            {field.field_type === 'textarea' ? (
              <FloatingTextarea
                label={`${field.label}${field.is_required ? ' *' : ''}`}
                value={formData[field.label] || ''}
                onChange={(e) => handleChange(field.label, e.target.value)}
                className="bg-background/50 border-border/50 min-h-[80px]"
                maxLength={2000}
              />
            ) : (
              <FloatingInput
                type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                label={`${field.label}${field.is_required ? ' *' : ''}`}
                value={formData[field.label] || ''}
                onChange={(e) => handleChange(field.label, e.target.value)}
                className="bg-background/50 border-border/50"
                maxLength={500}
              />
            )}
          </div>
        ))}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Submitting...' : 'Submit Claim'}
      </Button>
    </form>
  );
};
