import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OccupationPillSelector } from './OccupationPillSelector';
import { toast } from 'sonner';
import { Loader2, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GigPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GigPostForm: React.FC<GigPostFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [gigType, setGigType] = useState('freelance');
  const [description, setDescription] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);
  const [payType, setPayType] = useState('paid');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [contactInfo, setContactInfo] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!user || !title.trim()) return;
    setPublishing(true);
    try {
      const { error } = await supabase.from('gigs').insert({
        user_id: user.id,
        title: title.trim(),
        category: category.trim() || null,
        gig_type: gigType,
        description: description.trim() || null,
        roles_needed: rolesNeeded,
        pay_type: payType,
        budget: budget.trim() || null,
        duration: duration.trim() || null,
        location: location.trim() || null,
        visibility,
        contact_info: contactInfo.trim() || null,
        status: 'published',
      });
      if (error) throw error;
      toast.success('Gig published!');
      onSuccess();
      setTitle(''); setCategory(''); setDescription(''); setRolesNeeded([]);
      setBudget(''); setDuration(''); setLocation(''); setContactInfo('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish gig');
    } finally {
      setPublishing(false);
    }
  };

  const gigTypes = [
    { value: 'freelance', label: 'Freelance/Gig' },
    { value: 'fulltime', label: 'Full-time' },
    { value: 'internship', label: 'Internship' },
  ];

  const payTypes = [
    { value: 'paid', label: 'Paid' },
    { value: 'revenue_share', label: 'Revenue Share' },
    { value: 'credit_only', label: 'Credit Only' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Post a Gig</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2 pb-2">
          <FloatingInput label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary/50" />
          <FloatingInput label="Category (e.g. Cinematography)" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-secondary/50" />

          {/* Gig Type */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex gap-1.5">
              {gigTypes.map(t => (
                <button key={t.value} onClick={() => setGigType(t.value)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                    gigType === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/30'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <FloatingTextarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] bg-secondary/50" />

          {/* Roles Needed */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Roles Needed</p>
            <OccupationPillSelector selected={rolesNeeded} onChange={setRolesNeeded} />
          </div>

          {/* Pay Type */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Pay Type</p>
            <div className="flex gap-1.5">
              {payTypes.map(t => (
                <button key={t.value} onClick={() => setPayType(t.value)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95',
                    payType === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/30'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label="Budget (e.g. ₹5k/day)" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-secondary/50" />
            <FloatingInput label="Duration (e.g. 3 days)" value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-secondary/50" />
          </div>
          <FloatingInput label="Location (e.g. Mumbai, Remote)" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-secondary/50" />
          <FloatingInput label="Contact (email or phone)" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="bg-secondary/50" />

          {/* Visibility */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Visibility</p>
            <div className="flex gap-2">
              <button onClick={() => setVisibility('all')}
                className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all active:scale-95',
                  visibility === 'all' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-card text-muted-foreground border-border/30'
                )}>
                <Eye className="w-3.5 h-3.5" /> All Members
              </button>
              <button onClick={() => setVisibility('cohort_only')}
                className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all active:scale-95',
                  visibility === 'cohort_only' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-card text-muted-foreground border-border/30'
                )}>
                <Lock className="w-3.5 h-3.5" /> My Cohort
              </button>
            </div>
          </div>

          <Button onClick={handlePublish} disabled={publishing || !title.trim()} className="w-full gap-2">
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Publish Gig
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};