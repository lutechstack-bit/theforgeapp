import React, { useEffect, useState } from 'react';
import forgeLogo from '@/assets/forge-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1700);
    const removeTimer = setTimeout(() => onComplete(), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a1a] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Logo */}
      <div className="relative mb-6 animate-[splashLogoIn_0.8s_ease-out_both]">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full scale-150" />
        <img
          src={forgeLogo}
          alt="Forge"
          className="relative w-24 h-auto drop-shadow-lg"
        />
      </div>

      {/* Tagline */}
      <p className="text-lg md:text-xl font-medium tracking-wide animate-[splashTaglineIn_0.6s_ease-out_0.5s_both]">
        <span className="text-white/90">Where </span>
        <span className="text-primary font-bold">Dreamers</span>
        <span className="text-white/90"> Become </span>
        <span className="text-primary font-bold">Doers</span>
      </p>
    </div>
  );
};
