import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { TopProfileDropdown } from './TopProfileDropdown';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useAuth } from '@/contexts/AuthContext';
import { AppTour } from '@/components/tour/AppTour';

const AppLayoutContent: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const { profile } = useAuth();
  useActivityTracker();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);
  const isHome = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (profile && profile.has_seen_tour === false) {
      setShowTour(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background safe-area-pt">
      {showNav && <SideNav />}
      <main className={cn(
        "relative pb-24 md:pb-0 transition-all duration-300 ease-in-out safe-area-pb",
        showNav && (collapsed ? "md:ml-[72px]" : "md:ml-72")
      )}>
        {showNav && isHome && !isScrolled && (
          <div className="absolute top-4 right-4 z-40">
            <TopProfileDropdown />
          </div>
        )}
        {showNav && !(isHome && !isScrolled) && (
          <div className="sticky top-0 z-40 flex items-center justify-end h-14 px-4 bg-background">
            <TopProfileDropdown />
          </div>
        )}
        <Outlet />
      </main>
      {showNav && <BottomNav />}
      {showTour && profile?.id && (
        <AppTour userId={profile.id} onComplete={handleTourComplete} />
      )}
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
};
