import React, { useState, forwardRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, BookOpen, MessageCircle, LogOut, Bell, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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
  { to: '/', icon: Home, label: 'Home', tour: 'home' },
  { to: '/community', icon: MessageCircle, label: 'Community', tour: 'community' },
  { to: '/roadmap', icon: Map, label: 'Roadmap', tour: 'roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn', tour: 'learn' },
];

export const BottomNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const push = usePushNotifications();

    const onPushClick = async () => {
      if (!push.supported) { toast.error("Push isn't supported on this browser."); return; }
      if (push.permission === 'denied') { toast.error('Notifications are blocked in your browser settings — unblock them for this site, then retry.'); return; }
      if (push.subscribed) { await push.disable(); toast.info('Notifications turned off on this device.'); }
      else { const ok = await push.enable(); if (ok) toast.success('Notifications enabled on this device.'); else toast.error(push.error || 'Could not enable notifications.'); }
    };

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
          <div className="container px-1.5">
            <div className="flex items-stretch justify-between h-[68px] gap-0.5">
              {navItems.map(({ to, icon: Icon, label, tour }) => {
                const isActive = isNavActive(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    data-tour-mobile={tour}
                    className={cn(
                      "relative flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 rounded-2xl transition duration-300",
                      "active:scale-95 tap-feedback",
                      isActive
                        ? "text-primary bg-primary/10 nav-glow-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition duration-300",
                        isActive && "drop-shadow-[0_0_10px_hsl(var(--primary))]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={cn(
                      "max-w-full truncate text-[10px] font-medium tracking-tight leading-none",
                      isActive && "font-semibold"
                    )}>{label}</span>
                  </NavLink>
                );
              })}

              {/* Notifications toggle — always visible when push is supported */}
              {push.supported && (
                <button
                  onClick={onPushClick}
                  disabled={push.loading}
                  aria-label={push.subscribed ? 'Notifications on — tap to turn off' : 'Turn on notifications'}
                  className={cn(
                    "relative flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 rounded-2xl transition duration-300 active:scale-95 tap-feedback",
                    push.subscribed
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  {!push.subscribed && push.permission !== 'denied' && (
                    <span className="absolute top-1.5 right-1/4 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {push.subscribed
                    ? <BellRing className="h-5 w-5 shrink-0 transition duration-300 drop-shadow-[0_0_10px_hsl(var(--primary))]" strokeWidth={2.5} />
                    : <Bell className="h-5 w-5 shrink-0 transition duration-300" strokeWidth={2} />}
                  <span className={cn("max-w-full truncate text-[10px] font-medium tracking-tight leading-none", push.subscribed && "font-semibold")}>Alerts</span>
                </button>
              )}

              {/* Sign Out Button */}
              <button
                onClick={() => setConfirmOpen(true)}
                aria-label="Sign out"
                className={cn(
                  "relative flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 rounded-2xl transition duration-300",
                  "active:scale-95 tap-feedback",
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0 transition duration-300" strokeWidth={2} />
                <span className="max-w-full truncate text-[10px] font-medium tracking-tight leading-none">Sign Out</span>
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
