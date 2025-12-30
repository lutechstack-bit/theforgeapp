import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showNav && <TopBar />}
      <main className={`${showNav ? 'pb-20 pt-16' : ''}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};
