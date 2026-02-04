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
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground border-l-3 border-primary pl-3">Rules & Guidelines</h2>
          <p className="text-sm text-muted-foreground pl-3">Keep the Forge safe and creative for everyone</p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={[]} className="space-y-4">
        {/* Zero Tolerance */}
        <AccordionItem value="zero-tolerance" className="card-warm rounded-xl border-destructive/30 overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/15 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">Zero Tolerance Policy</h3>
                <p className="text-xs text-muted-foreground">Violation = Immediate removal</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-6">
            <div className="space-y-4 pt-3">
              {zeroToleranceItems.map((rule, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/15">
                  <div className="text-destructive mt-0.5 flex-shrink-0">{rule.icon}</div>
                  <div className="space-y-1.5">
                    <h4 className="font-medium text-primary/80 text-sm">{rule.title}</h4>
                    <p className="text-[15px] leading-relaxed text-foreground/90">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* General Rules */}
        <AccordionItem value="general" className="card-warm rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">General Rules</h3>
                <p className="text-xs text-muted-foreground">{generalRules.length} guidelines</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-6">
            <div className="space-y-4 pt-3">
              {generalRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/8 transition-colors">
                  <div className="text-primary mt-0.5 flex-shrink-0">{rule.icon}</div>
                  <div className="space-y-1.5">
                    <h4 className="font-medium text-primary/80 text-sm">{rule.title}</h4>
                    <p className="text-[15px] leading-relaxed text-foreground/90">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* House Rules */}
        <AccordionItem value="house" className="card-warm rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/20">
                <Home className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">House Rules</h3>
                <p className="text-xs text-muted-foreground">{houseRules.length} guidelines</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-6">
            <div className="space-y-4 pt-3">
              {houseRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/8 transition-colors">
                  <div className="text-primary mt-0.5 flex-shrink-0">{rule.icon}</div>
                  <div className="space-y-1.5">
                    <h4 className="font-medium text-primary/80 text-sm">{rule.title}</h4>
                    <p className="text-[15px] leading-relaxed text-foreground/90">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer note */}
      <div className="mt-8 p-5 rounded-xl gradient-subtle border border-primary/25 text-center">
        <p className="text-base text-foreground font-medium mb-1.5">
          Let's co-create a space where creativity and collaboration can thrive.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These rules exist to protect everyone and ensure the best experience for all.
        </p>
      </div>
    </section>
  );
};

export default RulesAccordion;
