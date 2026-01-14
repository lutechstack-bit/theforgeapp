import React from 'react';
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

  const handleContinue = () => {
    if (profile?.kyf_completed) {
      navigate('/');
    } else {
      navigate('/kyf');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
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
  );
};

export default Welcome;
