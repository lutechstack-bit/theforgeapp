import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { AnimatedOutlet } from './AnimatedOutlet';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const AppLayoutContent: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-[100dvh] bg-background safe-area-pt">
      {showNav && <SideNav />}
      <main className={cn(
        "relative pb-24 md:pb-0 transition-all duration-300 ease-in-out",
        showNav && (collapsed ? "md:ml-[72px]" : "md:ml-64")
      )}>
        <AnimatedOutlet />
      </main>
      {showNav && <BottomNav />}
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
