import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import forgeLogo from '@/assets/forge-logo.png';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/events', icon: Calendar, label: 'Event' },
  { to: '/perks', icon: Gift, label: 'Perks' },
];

export const SideNav: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-56 flex-col fixed left-0 top-0 bottom-0 bg-sidebar-background border-r border-sidebar-border z-40">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center">
          <img src={forgeLogo} alt="Forge" className="h-8 w-auto" />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-medium">U</span>
          </div>
          <span className="text-sm font-medium">Profile</span>
        </NavLink>
      </div>
    </aside>
  );
};
