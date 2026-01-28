import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const showBadge = profile?.profile_setup_completed && !profile?.ky_form_completed;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-area-pb">
      <div className="container">
        <div className="flex items-center justify-around h-[68px]">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            const needsBadge = to === '/profile' && showBadge;
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[52px] px-3 py-2 rounded-2xl transition-all duration-300",
                  "active:scale-95 tap-feedback",
                  isActive 
                    ? "text-primary bg-primary/10 nav-glow-active" 
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_10px_hsl(var(--primary))]"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {needsBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-premium-pulse shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide",
                  isActive && "font-semibold"
                )}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
