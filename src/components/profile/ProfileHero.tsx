import React from 'react';
import { User, MapPin, CheckCircle2, AlertCircle, Edit2, Briefcase, Camera } from 'lucide-react';
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
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-b from-secondary/80 to-background shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
      {/* Cover Banner - Increased height */}
      <div className="h-36 sm:h-52 relative">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 shadow-[inset_0_-40px_40px_-20px_rgba(0,0,0,0.4)]" />
        
        {/* Edit Button */}
        {isOwner && onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border-primary/30 hover:bg-background hover:border-primary/50 transition-all"
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
          <div 
            className="relative group w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-secondary border-4 border-primary flex items-center justify-center overflow-hidden shadow-[0_0_25px_-5px_hsl(var(--primary)/0.5)] transition-shadow hover:shadow-[0_0_35px_-5px_hsl(var(--primary)/0.7)]"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground" />
            )}
            
            {/* Camera overlay for owner - hints at editability */}
            {isOwner && onEdit && (
              <button
                onClick={onEdit}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-7 w-7 text-white" />
              </button>
            )}
            
            {/* Animated ring pulse for verified users */}
            {isVerified && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse pointer-events-none" />
            )}
          </div>
        </div>

        {/* Name & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                {profile?.full_name || 'Anonymous Creator'}
              </h1>
              {isVerified && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Forger
                </div>
              )}
            </div>

            {/* Role/Specialty */}
            {profile?.specialty && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4 text-primary/70" />
                <span className="font-medium">{profile.specialty}</span>
              </div>
            )}

            {/* Location */}
            {profile?.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/70" />
                <span>{profile.city}</span>
              </div>
            )}

            {/* Tagline */}
            {profile?.tagline && (
              <p className="text-muted-foreground italic text-sm sm:text-base pt-1">"{profile.tagline}"</p>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {isFullyOnboarded ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 font-medium">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Fully Onboarded
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-medium">
                <AlertCircle className="h-3 w-3 mr-1" />
                Preview Access
              </Badge>
            )}
            {edition && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium">
                {(edition as any)?.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
