import React from 'react';
import { User, MapPin, CheckCircle2, AlertCircle, Edit2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileHeroProps {
  profile: any;
  edition: any;
  isOwner?: boolean;
  onEdit?: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  edition,
  isOwner = false,
  onEdit,
}) => {
  const isVerified = profile?.ky_form_completed && profile?.payment_status === 'BALANCE_PAID';
  const isFullyOnboarded = profile?.payment_status === 'BALANCE_PAID';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/30">
      {/* Cover Banner */}
      <div className="h-32 sm:h-48 relative">
        <div className="absolute inset-0 gradient-primary opacity-80" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
        
        {/* Edit Button */}
        {isOwner && onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6 relative">
        {/* Avatar */}
        <div className="-mt-16 sm:-mt-20 mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-secondary border-4 border-primary flex items-center justify-center overflow-hidden shadow-glow">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-14 w-14 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Name & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {profile?.full_name || 'Anonymous Creator'}
              </h1>
              {isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Forger
                </div>
              )}
            </div>

            {/* Role/Specialty */}
            {profile?.specialty && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{profile.specialty}</span>
              </div>
            )}

            {/* Location */}
            {profile?.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.city}</span>
              </div>
            )}

            {/* Tagline */}
            {profile?.tagline && (
              <p className="text-muted-foreground italic">"{profile.tagline}"</p>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {isFullyOnboarded ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Fully Onboarded
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                Preview Access
              </Badge>
            )}
            {edition && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {edition.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
