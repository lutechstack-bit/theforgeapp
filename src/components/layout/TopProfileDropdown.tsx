import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TopProfileDropdown: React.FC = () => {
  const { profile } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const isProfileActive = location.pathname === '/profile';

  return (
    <div className="transition-all duration-300">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Profile menu"
            className={cn(
              "rounded-full ring-2 ring-primary/40 hover:ring-primary/70 transition-all duration-200 focus:outline-none focus:ring-primary",
              isProfileActive && "ring-primary"
            )}
          >
            <Avatar className="h-9 w-9">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'Profile'} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile?action=edit')} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
