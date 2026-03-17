import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { TopProfileDropdown } from './TopProfileDropdown';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const AppLayoutContent: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-[100dvh] bg-background safe-area-pt">
      {showNav && <SideNav />}
      <main className={cn(
        "relative pb-24 md:pb-0 transition-all duration-300 ease-in-out safe-area-pb",
        showNav && (collapsed ? "md:ml-[72px]" : "md:ml-72")
      )}>
        {showNav && (
          <div className={cn(
            "z-40 flex items-center justify-end h-14 px-4",
            isHome ? "absolute top-0 left-0 right-0" : "sticky top-0 bg-background"
          )}>
            <TopProfileDropdown />
          </div>
        )}
        <Outlet />
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
