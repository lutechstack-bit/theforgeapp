import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

const COLORS = [
  '#FFBC3B', // Forge Yellow
  '#D38F0C', // Forge Gold
  '#DD6F16', // Forge Orange
  '#FCF7EF', // Forge Cream
  '#10B981', // Emerald (for completion)
];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  onComplete,
  className,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate confetti particles
      const newParticles: ConfettiParticle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -20 - 10,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      // Auto-dismiss after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none z-50', className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: particle.color }}
          />
        </div>
      ))}
      {/* Burst overlay */}
      <div className="absolute inset-0 animate-celebration-burst">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0" />
      </div>
    </div>
  );
};

// Simpler TaskCompletedPop for individual task completion
export const TaskCompletedPop: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
      </div>
    </div>
  );
};
