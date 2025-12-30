import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Calendar, Map, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/perks', icon: Gift, label: 'Perks' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden">
      <div className="container">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
