import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const AppLayoutContent: React.FC = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showNav && <SideNav />}
      <main className={cn(
        "relative pb-20 md:pb-0 transition-all duration-300 ease-in-out",
        showNav && (collapsed ? "md:ml-[72px]" : "md:ml-64")
      )}>
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
