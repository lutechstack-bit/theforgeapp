import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GigPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PAY_TYPES = [
  { key: 'paid', label: 'Paid' },
  { key: 'revenue_share', label: 'Revenue Share' },
  { key: 'credit_only', label: 'Credit Only' },
];

export const GigPostForm: React.FC<GigPostFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    pay_type: 'paid',
    budget: '',
    location: '',
    roles_needed: '',
    contact_info: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('gigs').insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        pay_type: form.pay_type,
        budget: form.budget.trim() || null,
        location: form.location.trim() || null,
        roles_needed: form.roles_needed.split(',').map(r => r.trim()).filter(Boolean),
        contact_info: form.contact_info.trim() || null,
        status: 'published',
      });
      if (error) throw error;
      toast.success('Gig posted!');
      setForm({ title: '', description: '', category: '', pay_type: 'paid', budget: '', location: '', roles_needed: '', contact_info: '' });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post gig');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Gig</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FloatingInput label="Title *" value={form.title} onChange={e => update('title', e.target.value)} />
          <FloatingTextarea label="Description" value={form.description} onChange={e => update('description', e.target.value)} className="min-h-[80px]" />
          <FloatingInput label="Category" value={form.category} onChange={e => update('category', e.target.value)} />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Pay Type</p>
            <div className="flex gap-1.5">
              {PAY_TYPES.map(pt => (
                <button key={pt.key} onClick={() => update('pay_type', pt.key)}
                  className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all',
                    form.pay_type === pt.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/30'
                  )}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
          <FloatingInput label="Budget" value={form.budget} onChange={e => update('budget', e.target.value)} />
          <FloatingInput label="Location" value={form.location} onChange={e => update('location', e.target.value)} />
          <FloatingInput label="Roles needed (comma separated)" value={form.roles_needed} onChange={e => update('roles_needed', e.target.value)} />
          <FloatingInput label="Contact info" value={form.contact_info} onChange={e => update('contact_info', e.target.value)} />
          <Button onClick={handleSubmit} disabled={saving || !form.title.trim()} className="w-full gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Post Gig
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
