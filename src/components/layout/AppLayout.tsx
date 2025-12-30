import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showNav && <SideNav />}
      {showNav && <TopBar />}
      <main className={`${showNav ? 'md:ml-56 pb-20 md:pb-6 pt-16' : ''}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};
