import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMentorCheck } from '@/hooks/useMentorCheck';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface MentorRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for the /mentor area.
 *
 * Rules:
 *   - mentors_enabled feature flag must be on (admins bypass the flag so they
 *     can QA the experience before it ships).
 *   - user must hold the 'mentor' role (admins also pass — they need to be
 *     able to open the mentor workspace in impersonation-style to debug).
 */
export const MentorRoute: React.FC<MentorRouteProps> = ({ children }) => {
  const { isMentor, loading: mentorLoading } = useMentorCheck();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { isFeatureEnabled, isLoading: flagsLoading } = useFeatureFlags();

  if (mentorLoading || adminLoading || flagsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Verifying access...</div>
      </div>
    );
  }

  const flagOn = isFeatureEnabled('mentors_enabled');
  const allowed = (flagOn && isMentor) || isAdmin;

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
