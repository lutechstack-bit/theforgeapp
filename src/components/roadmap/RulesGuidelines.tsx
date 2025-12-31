import React from 'react';
import { 
  Shield, Clock, Volume2, Utensils, MessageSquare,
  Ban, Cigarette, Home, Wrench, Waves, AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RuleItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const zeroToleranceItems: RuleItem[] = [
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Unwelcome Comments or Advances',
    description: 'Flirtatious, sexual, or suggestive remarks, jokes, or gestures that make someone uncomfortable are not tolerated.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Bullying & Intimidation',
    description: 'No one should feel small, mocked, or unsafe. Kindness is not optional — it\'s the baseline.',
  },
  {
    icon: <Ban className="w-5 h-5" />,
    title: 'Any Kind of Discrimination',
    description: 'Targeting someone based on gender, background, accent, experience level, or personal style is not acceptable.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Invasion of Personal Space',
    description: 'Getting physically too close, touching without consent, or pressuring someone to share is off-limits.',
  },
];

const generalRules: RuleItem[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'What to Wear',
    description: 'Proper attire is required in all areas including your room to ensure comfort for all participants.',
  },
  {
    icon: <Ban className="w-5 h-5" />,
    title: 'Stay Sober',
    description: 'Any participant found intoxicated at any point will immediately be removed from the program.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Be Punctual',
    description: 'Sessions and workshops begin at scheduled times. Latecomers will not be accommodated.',
  },
  {
    icon: <Volume2 className="w-5 h-5" />,
    title: 'Quiet Hours',
    description: 'Maintain a quiet environment after 11 PM to ensure everyone gets adequate rest.',
  },
  {
    icon: <Utensils className="w-5 h-5" />,
    title: 'Meal Times',
    description: 'Breakfast: 8:30-9:30 AM • Lunch: 1:30-2:30 PM • High Tea: 4:30-5:00 PM • Dinner: 8:30-9:30 PM',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Feedback & Concerns',
    description: 'Please communicate any feedback or concerns to the LevelUp team immediately.',
  },
];

const houseRules: RuleItem[] = [
  {
    icon: <Ban className="w-5 h-5" />,
    title: 'No Alcohol',
    description: 'Alcohol is strictly prohibited within the premises for the duration of the program.',
  },
  {
    icon: <Cigarette className="w-5 h-5" />,
    title: 'Smoking Restrictions',
    description: 'Smoking with mentors is prohibited. Get consent from batchmates before smoking in shared spaces.',
  },
  {
    icon: <Home className="w-5 h-5" />,
    title: 'Stay In',
    description: 'Participants must remain within the location. If you leave, we won\'t be responsible for you or your film.',
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: 'Property & Equipment Care',
    description: 'Any damage must be compensated in full. Maintain the space as your way of giving back.',
  },
  {
    icon: <Waves className="w-5 h-5" />,
    title: 'Pool Usage',
    description: 'The swimming pool is reserved solely for shoots. Recreational swimming is not permitted.',
  },
];

const RulesGuidelines: React.FC = () => {
  const RuleCard = ({ rule, variant = 'default' }: { rule: RuleItem; variant?: 'default' | 'warning' }) => (
    <Card className={`p-4 ${variant === 'warning' ? 'border-destructive/30 bg-destructive/5' : 'glass-card'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${variant === 'warning' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          {rule.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-sm mb-1">{rule.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Zero Tolerance Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Zero Tolerance Policy</h3>
            <p className="text-xs text-muted-foreground">
              Any violation results in immediate removal without refund
            </p>
          </div>
        </div>
        <div className="grid gap-3">
          {zeroToleranceItems.map((rule, i) => (
            <RuleCard key={i} rule={rule} variant="warning" />
          ))}
        </div>
      </section>

      {/* General Rules Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">General Rules</h3>
        </div>
        <div className="grid gap-3">
          {generalRules.map((rule, i) => (
            <RuleCard key={i} rule={rule} />
          ))}
        </div>
      </section>

      {/* House Rules Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent/10">
            <Home className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-bold text-foreground">House Rules</h3>
        </div>
        <div className="grid gap-3">
          {houseRules.map((rule, i) => (
            <RuleCard key={i} rule={rule} />
          ))}
        </div>
      </section>

      {/* Note */}
      <div className="p-4 rounded-xl gradient-subtle border border-primary/20 text-center">
        <p className="text-sm text-foreground font-medium mb-1">
          Let's co-create a space where creativity and collaboration can thrive.
        </p>
        <p className="text-xs text-muted-foreground">
          These rules exist to protect everyone and ensure the best experience for all.
        </p>
      </div>
    </div>
  );
};

export default RulesGuidelines;