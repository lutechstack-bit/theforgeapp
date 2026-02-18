import React from 'react';
import { Clock } from 'lucide-react';
import type { KYSection } from './KYSectionConfig';

interface KYSectionIntroProps {
  section: KYSection;
}

export const KYSectionIntro: React.FC<KYSectionIntroProps> = ({ section }) => {
  return (
    <div className="flex flex-col items-center text-center px-2 py-3 space-y-3">
      {/* Icon with gold gradient ring */}
      <div className="w-14 h-14 rounded-2xl bg-forge-gold/10 border-2 border-forge-gold/25 flex items-center justify-center text-2xl shadow-[0_0_30px_-8px_hsl(var(--forge-gold)/0.3)]">
        {section.icon}
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight">
          {section.introTitle}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {section.introDescription}
        </p>
      </div>

      {/* Keep Handy */}
      {section.keepHandy.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <p className="text-xs font-bold tracking-widest uppercase text-forge-gold">
            Keep Handy
          </p>
          <div className="space-y-1.5">
            {section.keepHandy.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-forge-gold/5 border border-forge-gold/15"
              >
                <div className="w-7 h-7 rounded-lg bg-forge-gold/15 flex items-center justify-center text-sm shrink-0">
                  {item.emoji}
                </div>
                <span className="text-xs text-foreground text-left font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Estimate */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/40 px-4 py-2 rounded-full border border-border/30">
        <Clock className="w-3.5 h-3.5 text-forge-gold" />
        <span>Takes about {section.timeEstimate}</span>
      </div>
    </div>
  );
};
