import React from 'react';
import { Clock } from 'lucide-react';
import type { KYSection } from './KYSectionConfig';

interface KYSectionIntroProps {
  section: KYSection;
}

export const KYSectionIntro: React.FC<KYSectionIntroProps> = ({ section }) => {
  return (
    <div className="flex flex-col items-center text-center px-2 py-6 space-y-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl">
        {section.icon}
      </div>

      {/* Title & Description */}
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {section.introTitle}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {section.introDescription}
        </p>
      </div>

      {/* Keep Handy */}
      {section.keepHandy.length > 0 && (
        <div className="w-full max-w-sm space-y-3">
          <p className="text-xs font-bold tracking-widest uppercase text-primary">
            Keep Handy
          </p>
          <div className="space-y-2">
            {section.keepHandy.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-foreground text-left">
                  {item.emoji} {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Estimate */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>Takes about {section.timeEstimate}</span>
      </div>
    </div>
  );
};
