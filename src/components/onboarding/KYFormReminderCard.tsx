import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getKYFormSectionRoute, getKYFormName } from '@/lib/kyFormRoutes';

export const KYFormReminderCard: React.FC = () => {
  const { profile, edition } = useAuth();
  const navigate = useNavigate();

  // Don't show if profile setup not done or KY form already completed
  if (!profile?.profile_setup_completed || profile?.ky_form_completed) {
    return null;
  }

  return (
    <Card 
      className="glass-card border-primary/30 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
      onClick={() => navigate(getKYFormSectionRoute(edition?.cohort_type))}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{getKYFormName(edition?.cohort_type)}</h3>
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
