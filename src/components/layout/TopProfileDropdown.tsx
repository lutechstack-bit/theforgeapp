import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { calculateForgeMode } from '@/lib/forgeUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const cohortLabelMap: Record<string, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

export const TopProfileDropdown: React.FC = () => {
  const { profile } = useAuth();
  const { effectiveCohortType, effectiveEdition } = useEffectiveCohort();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const isProfileActive = location.pathname === '/profile';

  const forgeMode = calculateForgeMode(
    effectiveEdition?.forge_start_date,
    effectiveEdition?.forge_end_date,
  );

  const cohortLabel = forgeMode === 'POST_FORGE'
    ? 'Forge Community Member'
    : (effectiveCohortType ? cohortLabelMap[effectiveCohortType] || 'The Forge' : 'The Forge');

  return (
    <div className="transition-all duration-300">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            data-tour="profile-dropdown"
            aria-label="Profile menu"
            className={cn(
              "flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1.5",
              "transition-all duration-300 focus:outline-none",
              "hover:bg-black/50 hover:border-white/30",
              isProfileActive && "border-white/40"
            )}
          >
            <Avatar className="h-7 w-7">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'Profile'} />
              ) : null}
              <AvatarFallback className="bg-white/20 text-white text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-white">{firstName}</span>
              <span className="text-[10px] text-white/70">{cohortLabel}</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile?action=edit')} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
