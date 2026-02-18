import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { KYFormCompletion } from '@/components/kyform/KYFormCompletion';
import { Button } from '@/components/ui/button';
import { Map, UserCircle, MessageCircle, ArrowRight } from 'lucide-react';

const Welcome: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const cohortType = (profile as any)?.edition?.cohort_type || 'FORGE';

  // If KY form is completed, show the celebration
  if (profile?.ky_form_completed) {
    return <KYFormCompletion cohortType={cohortType} />;
  }

  const quickStartItems = [
    { icon: Map, title: 'Explore Roadmap', description: 'See your Forge journey ahead', to: '/roadmap' },
    { icon: UserCircle, title: 'Set Up Profile', description: 'Complete your creator profile', to: '/profile?action=edit' },
    { icon: MessageCircle, title: 'Join Community', description: 'Connect with your batchmates', to: '/community' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome to Forge! 🎬
          </h1>
          <p className="text-muted-foreground">
            Here's how to get started on your creative journey
          </p>
        </div>

        <div className="space-y-3">
          {quickStartItems.map(({ icon: Icon, title, description, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <Button
          variant="premium"
          size="lg"
          className="w-full"
          onClick={() => navigate('/')}
        >
          Get Started
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
