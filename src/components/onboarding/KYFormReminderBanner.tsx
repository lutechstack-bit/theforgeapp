import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const KYFormReminderBanner: React.FC = () => {
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
        return 'Know Your Form';
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 animate-pulse-slow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Complete Your {getFormName()} Form</h3>
            <p className="text-sm text-muted-foreground">Help us personalize your Forge experience</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(getFormRoute())}
          className="shrink-0"
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
