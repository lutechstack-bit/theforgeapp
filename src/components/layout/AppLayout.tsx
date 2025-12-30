import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { SideNav } from './SideNav';
import { CountdownBanner } from '../shared/CountdownBanner';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavRoutes = ['/auth', '/welcome', '/kyf'];
  const showNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen gradient-bg">
      {/* FOMO Countdown Banner - Always on top */}
      {showNav && <CountdownBanner />}
      
      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-glow-secondary/5 rounded-full blur-3xl" />
      </div>
      
      {showNav && <SideNav />}
      {showNav && <TopBar />}
      {/* Extra padding top to account for countdown banner */}
      <main className={`relative z-10 ${showNav ? 'md:ml-56 pb-20 md:pb-6 pt-28' : ''}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};
