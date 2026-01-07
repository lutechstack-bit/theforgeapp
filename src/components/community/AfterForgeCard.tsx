import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, Gift, ChevronRight } from 'lucide-react';

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
}

const benefits: Benefit[] = [
  {
    icon: Users,
    title: 'Network',
    description: 'Lifetime access to Forge community',
    link: '/community',
  },
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Access to all learning content',
    link: '/learn',
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Priority invites to future events',
    link: '/events',
  },
  {
    icon: Gift,
    title: 'Perks',
    description: 'Exclusive partner discounts',
    link: '/perks',
  },
];

export const AfterForgeCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">After Forge</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        What you get as a Forge alumni:
      </p>

      <div className="space-y-2">
        {benefits.map((benefit) => (
          <button
            key={benefit.title}
            onClick={() => navigate(benefit.link)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <benefit.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">
                {benefit.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {benefit.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
