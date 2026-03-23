import React, { useState, forwardRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, BookOpen, MessageCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const navItems = [
  { to: '/', icon: Home, label: 'Home', tourKey: 'home' },
  { to: '/community', icon: MessageCircle, label: 'Community', tourKey: 'community' },
  { to: '/roadmap', icon: Map, label: 'Roadmap', tourKey: 'roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn', tourKey: 'learn' },
];

export const BottomNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isNavActive = (to: string) => {
      if (to === '/') return location.pathname === '/';
      return location.pathname === to || location.pathname.startsWith(to + '/');
    };

    const handleSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
      navigate('/auth');
    };

    return (
      <>
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-area-pb" {...props}>
          <div className="container">
            <div className="flex items-center justify-around h-[68px]">
              {navItems.map(({ to, icon: Icon, label, tourKey }) => {
                const isActive = isNavActive(to);
                return (
                  <NavLink
                    data-tour={`${tourKey}-nav-mobile`}
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

              {/* Sign Out Button */}
              <button
                onClick={() => setConfirmOpen(true)}
                aria-label="Sign out"
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[52px] px-3 py-2 rounded-2xl transition-all duration-300",
                  "active:scale-95 tap-feedback",
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                )}
              >
                <LogOut className="h-5 w-5 transition-all duration-300" strokeWidth={2} />
                <span className="text-[10px] font-medium tracking-wide">Sign Out</span>
              </button>
            </div>
          </div>
        </nav>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of your account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

BottomNav.displayName = 'BottomNav';
