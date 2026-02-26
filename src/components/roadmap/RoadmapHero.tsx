import React from 'react';
import { Rocket, Trophy, Star } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
}

const RoadmapHero: React.FC<RoadmapHeroProps> = ({
  cohortName,
  forgeMode,
  forgeStartDate,
}) => {
  const daysUntilForge = forgeStartDate ? differenceInDays(forgeStartDate, new Date()) : null;

  return (
    <div className="relative mb-8">
      <div className="rounded-2xl border border-[#FFBF00]/20 bg-card p-6">
        {/* Status & Title */}
        <div className="text-center sm:text-left">
          {forgeMode === 'PRE_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {daysUntilForge !== null && daysUntilForge > 0 
                    ? `${daysUntilForge} days until Forge`
                    : 'Forge begins soon!'}
                </span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Awaits</h1>
              <p className="text-sm text-muted-foreground">Get ready for the experience of a lifetime</p>
            </>
          )}

          {forgeMode === 'DURING_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-3 animate-pulse-soft">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-bold text-primary">FORGE IS LIVE</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Journey</h1>
              <p className="text-sm text-muted-foreground">You're creating something amazing</p>
            </>
          )}

          {forgeMode === 'POST_FORGE' && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 mb-3">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent">FORGE COMPLETE</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-1">Your {cohortName} Legacy</h1>
              <p className="text-sm text-muted-foreground">Look back at what you've accomplished</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapHero;
