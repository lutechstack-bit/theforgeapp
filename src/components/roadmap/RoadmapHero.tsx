import React from 'react';
import { Rocket, Trophy, Star } from 'lucide-react';

interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const RoadmapHero: React.FC<RoadmapHeroProps> = ({
  cohortName,
  forgeMode,
}) => {
  return (
    <div className="relative mb-8">
      <div className="relative overflow-hidden rounded-2xl border-l-4 border-primary/40 bg-card">
        {/* Radial gradient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_60%)]" />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/placeholder.svg')]" />

        <div className="relative p-6 text-center sm:text-left">
          {forgeMode === 'PRE_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Forge begins soon</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Get Ready for {cohortName}</h1>
              <p className="text-sm text-muted-foreground">Prepare for the experience of a lifetime</p>
            </>
          )}

          {forgeMode === 'DURING_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-3 animate-pulse-soft">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-bold text-primary">FORGE IS LIVE</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">{cohortName} Journey</h1>
              <p className="text-sm text-muted-foreground">You're creating something amazing</p>
            </>
          )}

          {forgeMode === 'POST_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 mb-3">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent">FORGE COMPLETE</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">{cohortName} Legacy</h1>
              <p className="text-sm text-muted-foreground">Look back at what you accomplished</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapHero;
