import React from 'react';
import forgeLogo from '@/assets/forge-logo.png';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img src={forgeLogo} alt="the Forge" className="h-10 opacity-80" />
        <div className="animate-pulse text-primary text-sm">Loading...</div>
      </div>
    </div>
  );
};
