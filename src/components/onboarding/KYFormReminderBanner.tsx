import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getKYFormSectionRoute, getKYFormName } from '@/lib/kyFormRoutes';

export const KYFormReminderBanner: React.FC = () => {
  const { profile, edition } = useAuth();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  // Don't show for admins, if profile setup not done, or if KY form already completed
  if (isAdmin || !profile?.profile_setup_completed || profile?.ky_form_completed) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 md:p-5 mb-6 animate-pulse-slow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-primary/20 rounded-lg">
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base md:text-lg">Complete Your {getKYFormName(edition?.cohort_type)} Form</h3>
            <p className="text-sm md:text-base text-muted-foreground">Help us personalize your Forge experience</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(getKYFormSectionRoute(edition?.cohort_type))}
          className="shrink-0 w-full sm:w-auto"
          size="lg"
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
