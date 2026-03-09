import React from 'react';
import { BentoTile } from './BentoTile';
import { CheckCircle2, MessageSquare, Clock, Award } from 'lucide-react';

interface BentoBadgesTileProps {
  isVerified: boolean;
  messageCount: number;
  hasStudentFilm: boolean;
  memberSince?: string;
}

export const BentoBadgesTile: React.FC<BentoBadgesTileProps> = ({
  isVerified,
  messageCount,
  hasStudentFilm,
  memberSince,
}) => {
  const isEarlyMember = memberSince
    ? new Date(memberSince) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  const badges = [
    { id: 'verified', label: 'Verified Forger', icon: <CheckCircle2 className="h-3.5 w-3.5" />, earned: isVerified },
    { id: 'active', label: 'Active Member', icon: <MessageSquare className="h-3.5 w-3.5" />, earned: messageCount >= 5 },
    { id: 'first_post', label: 'First Post', icon: <MessageSquare className="h-3.5 w-3.5" />, earned: messageCount >= 1 },
    { id: 'showcase', label: 'Showcase', icon: <Award className="h-3.5 w-3.5" />, earned: hasStudentFilm },
    { id: 'early', label: 'Early Adopter', icon: <Clock className="h-3.5 w-3.5" />, earned: isEarlyMember },
  ].filter(b => b.earned);

  return (
    <BentoTile
      label="Badges"
      icon="★"
      className="col-span-full md:col-span-4 row-span-2"
      animationDelay={0.32}
    >
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/8 border border-primary/40 text-primary"
            >
              {badge.icon}
              {badge.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/50 italic">Earn badges by participating</p>
      )}
    </BentoTile>
  );
};
