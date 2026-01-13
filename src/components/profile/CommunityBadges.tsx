import React from 'react';
import { CheckCircle2, MessageSquare, Clock, Award } from 'lucide-react';

interface CommunityBadgesProps {
  isVerified: boolean;
  messageCount: number;
  hasStudentFilm: boolean;
  memberSince?: string;
}

interface BadgeConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  earned: boolean;
  description: string;
}

export const CommunityBadges: React.FC<CommunityBadgesProps> = ({
  isVerified,
  messageCount,
  hasStudentFilm,
  memberSince,
}) => {
  // Check if member joined early (within 30 days - placeholder logic)
  const isEarlyMember = memberSince ? 
    new Date(memberSince) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false;

  const badges: BadgeConfig[] = [
    {
      id: 'verified',
      label: 'Verified Forger',
      icon: <CheckCircle2 className="h-4 w-4" />,
      earned: isVerified,
      description: 'Completed KY form and full payment',
    },
    {
      id: 'active',
      label: 'Active Member',
      icon: <MessageSquare className="h-4 w-4" />,
      earned: messageCount >= 5,
      description: '5+ community messages',
    },
    {
      id: 'first_post',
      label: 'First Post',
      icon: <MessageSquare className="h-4 w-4" />,
      earned: messageCount >= 1,
      description: 'Sent first community message',
    },
    {
      id: 'showcase',
      label: 'Showcase Participant',
      icon: <Award className="h-4 w-4" />,
      earned: hasStudentFilm,
      description: 'Has work in student showcase',
    },
    {
      id: 'early',
      label: 'Early Adopter',
      icon: <Clock className="h-4 w-4" />,
      earned: isEarlyMember,
      description: 'Joined in first 30 days',
    },
  ];

  const earnedBadges = badges.filter((b) => b.earned);

  if (earnedBadges.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">Community Badges</h2>
      
      <div className="flex flex-wrap gap-3">
        {earnedBadges.map((badge) => (
          <div
            key={badge.id}
            className="group relative flex items-center gap-2 px-3 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-medium cursor-default"
            title={badge.description}
          >
            {badge.icon}
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
};
