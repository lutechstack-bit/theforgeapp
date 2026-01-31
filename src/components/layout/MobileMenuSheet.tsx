import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Map, 
  BookOpen, 
  Calendar, 
  Users, 
  Info, 
  Settings, 
  LogOut,
  ChevronRight,
  X,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { SheetContent, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import forgeLogo from '@/assets/forge-logo.png';

const menuItems = [
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/updates', icon: Info, label: 'About Forge' },
];

interface MobileMenuSheetProps {
  onClose: () => void;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({ onClose }) => {
  const { profile, edition, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  const handleNavigation = (to: string) => {
    onClose();
    navigate(to);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <SheetContent 
      side="right" 
      className="w-[85%] sm:max-w-md p-0 flex flex-col bg-background border-l border-border/50"
    >
      {/* Accessible title and description for screen readers */}
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      <SheetDescription className="sr-only">
        Access your profile, navigate to different sections, or sign out
      </SheetDescription>

      {/* Header with greeting */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
        <h2 className="text-xl font-semibold text-foreground">
          Hi, {firstName}! <span className="inline-block animate-wave">👋</span>
        </h2>
        <SheetClose className="rounded-full p-2 hover:bg-muted/50 transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </SheetClose>
      </div>

      {/* Profile Card */}
      <div className="px-6 py-5 border-b border-border/50">
        <button
          onClick={() => handleNavigation('/profile')}
          className="flex items-center gap-4 w-full p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
        >
          <Avatar className="h-16 w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'Profile'} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground text-lg">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-sm text-muted-foreground">
              theforgeapp.com/u/{profile?.instagram_handle || 'profile'}
            </p>
            {edition?.cohort_type && (
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {edition.cohort_type}
              </Badge>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {menuItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-muted/50"
              )}
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3.5">
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-[15px]",
                      isActive && "font-medium"
                    )}>{label}</span>
                  </span>
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )} />
                </>
              )}
            </NavLink>
          ))}

          {/* Admin Link - Only visible to admins */}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-muted/50"
              )}
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3.5">
                    <Shield className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-[15px]",
                      isActive && "font-medium"
                    )}>Admin Panel</span>
                  </span>
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )} />
                </>
              )}
            </NavLink>
          )}
        </div>
      </nav>

      {/* Secondary Actions */}
      <div className="border-t border-border/50 px-4 py-3">
        <button
          onClick={() => handleNavigation('/profile?action=edit')}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-foreground hover:bg-muted/50 transition-all duration-200"
        >
          <span className="flex items-center gap-3.5">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-[15px]">Settings</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </button>
        
        <button
          onClick={handleSignOut}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <span className="flex items-center gap-3.5">
            <LogOut className="h-5 w-5" />
            <span className="text-[15px]">Sign Out</span>
          </span>
        </button>
      </div>

      {/* Brand Footer */}
      <div className="px-6 py-4 border-t border-border/50 flex justify-center">
        <img 
          src={forgeLogo} 
          alt="Forge" 
          className="h-8 opacity-60"
        />
      </div>
    </SheetContent>
  );
};
