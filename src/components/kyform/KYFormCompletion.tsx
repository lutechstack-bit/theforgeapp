import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, User, Home, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KYFormCompletionProps {
  cohortType?: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
  onNavigateHome?: () => void;
  onNavigateProfile?: () => void;
}

// Confetti particle colors matching the Forge brand
const CONFETTI_COLORS = [
  'bg-primary', // Yellow
  'bg-accent', // Gold
  'bg-forge-orange', // Orange
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
];

interface ConfettiParticle {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export const KYFormCompletion: React.FC<KYFormCompletionProps> = ({
  cohortType = 'FORGE',
  onNavigateHome,
  onNavigateProfile,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Generate confetti particles
    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 1.5,
        size: 8 + Math.random() * 8,
      });
    }
    setParticles(newParticles);

    // Show content after a brief delay
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
    }
  };

  const handleNavigateProfile = () => {
    if (onNavigateProfile) {
      onNavigateProfile();
    } else {
      navigate('/profile');
    }
  };

  const getCohortLabel = () => {
    switch (cohortType) {
      case 'FORGE_WRITING':
        return 'The Forge Writing';
      case 'FORGE_CREATORS':
        return 'The Forge Creators';
      default:
        return 'The Forge';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={cn(
              'absolute rounded-sm',
              particle.color
            )}
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `confetti-fall ${particle.duration}s linear ${particle.delay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div
        className={cn(
          'relative z-10 text-center px-6 max-w-md mx-auto transition-all duration-700',
          showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        {/* Celebration icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6 animate-bounce-subtle">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>

        {/* Welcome message */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome to
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
          {getCohortLabel()}!
        </h2>

        {/* User name */}
        {profile?.full_name && (
          <p className="text-lg text-muted-foreground mb-6">
            We're excited to have you, <span className="text-foreground font-medium">{profile.full_name}</span>!
          </p>
        )}

        {/* Quick stats card */}
        <div className="glass-card rounded-2xl p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-2">Your profile is now complete</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Form Submitted Successfully</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 text-base"
            onClick={handleNavigateProfile}
          >
            <User className="h-4 w-4 mr-2" />
            View Your Profile
          </Button>
          <Button
            className="flex-1 h-12 text-base gradient-primary text-primary-foreground"
            onClick={handleNavigateHome}
          >
            <Home className="h-4 w-4 mr-2" />
            Explore Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
