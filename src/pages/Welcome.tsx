import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, BookOpen, Rocket } from 'lucide-react';
import forgeLogo from '@/assets/forge-logo.png';

const features = [
  {
    icon: Users,
    title: 'Connect',
    description: 'Meet fellow creators and build lasting relationships',
  },
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Access exclusive content and mentorship',
  },
  {
    icon: Rocket,
    title: 'Create',
    description: 'Launch your projects with community support',
  },
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'logo' | 'text' | 'fadeout'>('logo');

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase('text'), 1500);
    const timer2 = setTimeout(() => setIntroPhase('fadeout'), 2500);
    const timer3 = setTimeout(() => setShowIntro(false), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleContinue = () => {
    if (profile?.kyf_completed) {
      navigate('/');
    } else {
      navigate('/kyf');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Intro Animation Overlay */}
      {showIntro && (
        <div 
          className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
            introPhase === 'fadeout' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-radial from-primary/40 via-primary/10 to-transparent animate-intro-glow" />
          
          {/* Expanding Ring Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/60 animate-ring-expand" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-forge-gold/40 animate-ring-expand" style={{ animationDelay: '0.3s' }} />
          </div>
          
          {/* Forge Logo with Glow */}
          <div className={`relative z-10 transition-all duration-700 ${
            introPhase === 'logo' ? 'opacity-100 scale-100' : introPhase === 'text' ? 'opacity-100 scale-90 -translate-y-8' : 'opacity-0 scale-110'
          }`}>
            {/* Outer glow */}
            <div className="absolute inset-0 -m-8 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            {/* Inner glow */}
            <div className="absolute inset-0 -m-4 bg-forge-gold/40 rounded-full blur-xl" />
            {/* Logo */}
            <img 
              src={forgeLogo} 
              alt="Forge" 
              className="w-28 h-28 md:w-36 md:h-36 relative z-10 drop-shadow-2xl animate-logo-scale"
            />
          </div>

          {/* Text Reveal */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 mt-16 md:mt-20 text-center transition-all duration-700 ${
            introPhase === 'text' ? 'opacity-100 translate-y-0' : introPhase === 'fadeout' ? 'opacity-0 translate-y-4' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-lg md:text-xl text-white/90 font-light mb-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Welcome to the
            </p>
            <h1 className="text-3xl md:text-5xl font-bold animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <span className="bg-gradient-to-r from-primary via-forge-gold to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer">
                Inner Circle
              </span>
            </h1>
          </div>
        </div>
      )}

      {/* Main Content (existing Welcome page) */}
      <div className={`transition-opacity duration-500 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        {/* Enhanced Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative w-full max-w-lg space-y-8 text-center animate-slide-up">
          <div className="space-y-5">
            {/* Forge Logo with Glow */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
              <img 
                src={forgeLogo} 
                alt="Forge" 
                className="relative w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold">
              Welcome to the{' '}
              <span className="gradient-text">Inner Circle</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your creative journey begins here.
            </p>
          </div>

          <div className="grid gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <Button
              variant="premium"
              size="xl"
              className="w-full"
              onClick={handleContinue}
            >
              {profile?.kyf_completed ? 'Enter' : 'Start'}
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              {profile?.kyf_completed 
                ? 'Your Inner Circle awaits'
                : 'A few quick questions to personalize your experience'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
