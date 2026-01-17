import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Calendar, Map, Gift, User } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Main nav content with glass effect */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="container">
          <div className="flex items-center justify-around h-16">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              const needsBadge = to === '/profile' && showBadge;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                    "active:scale-95", // Press animation for tactile feedback
                    isActive 
                      ? "text-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                    )} />
                    {needsBadge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
      {/* Safe area spacer for iOS home indicator */}
      <div className="bg-background/95 safe-area-pb" />
    </nav>
  );
};
