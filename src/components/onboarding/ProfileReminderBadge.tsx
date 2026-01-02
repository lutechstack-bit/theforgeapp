import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileReminderBadgeProps {
  className?: string;
}

export const ProfileReminderBadge: React.FC<ProfileReminderBadgeProps> = ({ className = '' }) => {
  const { profile } = useAuth();

  // Show badge if KY form is not completed
  if (!profile || profile.ky_form_completed) {
    return null;
  }

  return (
    <span className={`absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)] ${className}`} />
  );
};
