import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
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
  const { profile } = useAuth();

  return (
    <aside className="hidden md:flex w-56 flex-col fixed left-0 top-[52px] bottom-0 z-40 glass-nav border-r border-white/10">
      {/* Logo with subtle glow */}
      <div className="p-6 border-b border-white/10">
        <NavLink to="/" className="flex items-center group">
          <img 
            src={forgeLogo} 
            alt="Forge" 
            className="h-10 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" 
          />
        </NavLink>
      </div>

      {/* Navigation with glass buttons */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group",
                isActive
                  ? "bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] backdrop-blur-sm"
                  : "glass-card text-sidebar-foreground hover:bg-white/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive ? "" : "group-hover:text-primary"
              )} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section with glass card */}
      <div className="p-4 border-t border-white/10">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/30 flex items-center justify-center overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-sidebar-foreground group-hover:text-primary transition-colors duration-300">Profile</span>
        </NavLink>
      </div>
    </aside>
  );
};
