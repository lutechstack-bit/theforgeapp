import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift, Sun, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import forgeLogo from '@/assets/forge-logo.png';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/perks', icon: Gift, label: 'Perks' },
];

export const SideNav: React.FC = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border">
      {/* Logo + Title */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img 
          src={forgeLogo} 
          alt="Forge" 
          className="h-8 w-auto" 
        />
        <span className="text-base font-semibold text-sidebar-foreground tracking-tight">Student Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 space-y-1 border-t border-sidebar-border">
        {/* Light Mode Toggle */}
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200">
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
        </button>

        {/* User Profile */}
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-sidebar-accent transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <span className="text-sm font-medium text-sidebar-foreground truncate">
            {profile?.full_name || 'Profile'}
          </span>
        </NavLink>

        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
