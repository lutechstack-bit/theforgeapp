import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift, Info, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import forgeIcon from '@/assets/forge-icon.png';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/community', icon: Users, label: 'Community' },
];

export const SideNav: React.FC = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden md:flex w-72 flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-6 py-8 flex items-center justify-start">
        <img 
          src={forgeIcon} 
          alt="Forge" 
          className="h-10 w-auto" 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-[15px] font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-6 space-y-2">
        {/* About Link */}
        <NavLink
          to="/kyf"
          className={cn(
            "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-[15px] font-medium",
            location.pathname === '/kyf'
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Info className="h-5 w-5" strokeWidth={1.5} />
          <span>About Forge</span>
        </NavLink>

        {/* User Profile Row */}
        <div className="flex items-center justify-between px-4 py-3">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-sidebar-border flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-sidebar-foreground">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-sidebar-foreground/80">
              {profile?.full_name?.split(' ')[0] || 'Profile'}
            </span>
          </NavLink>
          
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
            title="Sign out"
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};
