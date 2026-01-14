import React from 'react';
import { 
  Shield, Clock, Volume2, Utensils, MessageSquare,
  Ban, Cigarette, Home, Wrench, Waves, AlertTriangle,
  ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface RuleItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const zeroToleranceItems: RuleItem[] = [
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'Unwelcome Comments or Advances',
    description: 'Flirtatious, sexual, or suggestive remarks, jokes, or gestures that make someone uncomfortable are not tolerated.',
  },
  {
    icon: <Shield className="w-4 h-4" />,
    title: 'Bullying & Intimidation',
    description: 'No one should feel small, mocked, or unsafe. Kindness is not optional — it\'s the baseline.',
  },
  {
    icon: <Ban className="w-4 h-4" />,
    title: 'Any Kind of Discrimination',
    description: 'Targeting someone based on gender, background, accent, experience level, or personal style is not acceptable.',
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'Invasion of Personal Space',
    description: 'Getting physically too close, touching without consent, or pressuring someone to share is off-limits.',
  },
];

const generalRules: RuleItem[] = [
  { icon: <Shield className="w-4 h-4" />, title: 'What to Wear', description: 'Proper attire is required in all areas including your room to ensure comfort for all participants.' },
  { icon: <Ban className="w-4 h-4" />, title: 'Stay Sober', description: 'Any participant found intoxicated at any point will immediately be removed from the program.' },
  { icon: <Clock className="w-4 h-4" />, title: 'Be Punctual', description: 'Sessions and workshops begin at scheduled times. Latecomers will not be accommodated.' },
  { icon: <Volume2 className="w-4 h-4" />, title: 'Quiet Hours', description: 'Maintain a quiet environment after 11 PM to ensure everyone gets adequate rest.' },
  { icon: <Utensils className="w-4 h-4" />, title: 'Meal Times', description: 'Breakfast: 8:30-9:30 AM • Lunch: 1:30-2:30 PM • High Tea: 4:30-5:00 PM • Dinner: 8:30-9:30 PM' },
  { icon: <MessageSquare className="w-4 h-4" />, title: 'Feedback & Concerns', description: 'Please communicate any feedback or concerns to the LevelUp team immediately.' },
];

const houseRules: RuleItem[] = [
  { icon: <Ban className="w-4 h-4" />, title: 'No Alcohol', description: 'Alcohol is strictly prohibited within the premises for the duration of the program.' },
  { icon: <Cigarette className="w-4 h-4" />, title: 'Smoking Restrictions', description: 'Smoking with mentors is prohibited. Get consent from batchmates before smoking in shared spaces.' },
  { icon: <Home className="w-4 h-4" />, title: 'Stay In', description: 'Participants must remain within the location. If you leave, we won\'t be responsible for you or your film.' },
  { icon: <Wrench className="w-4 h-4" />, title: 'Property & Equipment Care', description: 'Any damage must be compensated in full. Maintain the space as your way of giving back.' },
  { icon: <Waves className="w-4 h-4" />, title: 'Pool Usage', description: 'The swimming pool is reserved solely for shoots. Recreational swimming is not permitted.' },
];

const RulesAccordion: React.FC = () => {
  return (
    <section id="roadmap-rules" className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Rules & Guidelines</h2>
          <p className="text-sm text-muted-foreground">Keep the Forge safe and creative for everyone</p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={[]} className="space-y-3">
        {/* Zero Tolerance */}
        <AccordionItem value="zero-tolerance" className="glass-card rounded-xl border-destructive/20 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">Zero Tolerance Policy</h3>
                <p className="text-xs text-muted-foreground">Violation = Immediate removal</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {zeroToleranceItems.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div className="text-destructive mt-0.5">{rule.icon}</div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{rule.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* General Rules */}
        <AccordionItem value="general" className="glass-card rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">General Rules</h3>
                <p className="text-xs text-muted-foreground">{generalRules.length} guidelines</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 pt-2">
              {generalRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="text-primary mt-0.5">{rule.icon}</div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{rule.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* House Rules */}
        <AccordionItem value="house" className="glass-card rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Home className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">House Rules</h3>
                <p className="text-xs text-muted-foreground">{houseRules.length} guidelines</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2 pt-2">
              {houseRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="text-accent mt-0.5">{rule.icon}</div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{rule.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer note */}
      <div className="mt-6 p-4 rounded-xl gradient-subtle border border-primary/20 text-center">
        <p className="text-sm text-foreground font-medium mb-1">
          Let's co-create a space where creativity and collaboration can thrive.
        </p>
        <p className="text-xs text-muted-foreground">
          These rules exist to protect everyone and ensure the best experience for all.
        </p>
      </div>
    </section>
  );
};

export default RulesAccordion;
