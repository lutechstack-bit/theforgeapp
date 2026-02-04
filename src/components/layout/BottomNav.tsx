import React, { useState, forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, BookOpen, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { MobileMenuSheet } from './MobileMenuSheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
];

export const BottomNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const location = useLocation();
    const { profile } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const showBadge = profile?.profile_setup_completed && !profile?.ky_form_completed;
    const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

    return (
      <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-area-pb" {...props}>
        <div className="container">
          <div className="flex items-center justify-around h-[68px]">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
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
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_10px_hsl(var(--primary))]"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "text-[10px] font-medium tracking-wide",
                    isActive && "font-semibold"
                  )}>{label}</span>
                </NavLink>
              );
            })}

            {/* Profile Menu Trigger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[52px] px-3 py-2 rounded-2xl transition-all duration-300",
                    "active:scale-95 tap-feedback",
                    menuOpen 
                      ? "text-primary bg-primary/10 nav-glow-active" 
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={profile.avatar_url} alt="" />
                        <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User 
                        className={cn(
                          "h-5 w-5 transition-all duration-300",
                          menuOpen && "drop-shadow-[0_0_10px_hsl(var(--primary))]"
                        )} 
                        strokeWidth={menuOpen ? 2.5 : 2}
                      />
                    )}
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-premium-pulse shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium tracking-wide",
                    menuOpen && "font-semibold"
                  )}>Profile</span>
                </button>
              </SheetTrigger>
              <MobileMenuSheet onClose={() => setMenuOpen(false)} />
            </Sheet>
          </div>
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';
