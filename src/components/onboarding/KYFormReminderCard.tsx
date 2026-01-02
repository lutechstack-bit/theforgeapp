import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const KYFormReminderCard: React.FC = () => {
  const { profile, edition } = useAuth();
  const navigate = useNavigate();

  // Don't show if profile setup not done or KY form already completed
  if (!profile?.profile_setup_completed || profile?.ky_form_completed) {
    return null;
  }

  const getFormRoute = () => {
    switch (edition?.cohort_type) {
      case 'FORGE':
        return '/kyf-form';
      case 'FORGE_CREATORS':
        return '/kyc-form';
      case 'FORGE_WRITING':
        return '/kyw-form';
      default:
        return '/kyf-form';
    }
  };

  const getFormName = () => {
    switch (edition?.cohort_type) {
      case 'FORGE':
        return 'Know Your Filmmaker';
      case 'FORGE_CREATORS':
        return 'Know Your Creator';
      case 'FORGE_WRITING':
        return 'Know Your Writer';
      default:
        return 'Complete Form';
    }
  };

  return (
    <Card 
      className="glass-card border-primary/30 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
      onClick={() => navigate(getFormRoute())}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{getFormName()}</h3>
            <p className="text-sm text-muted-foreground">Required to unlock full access</p>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-0 bg-primary rounded-full" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">0% complete</p>
      </CardContent>
    </Card>
  );
};
