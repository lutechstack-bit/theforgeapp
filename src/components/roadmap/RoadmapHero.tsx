import React from 'react';
import { Rocket, Trophy, Star } from 'lucide-react';

interface RoadmapHeroProps {
  cohortName: string;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const RoadmapHero: React.FC<RoadmapHeroProps> = ({ cohortName, forgeMode }) => {
  return (
    <div className="relative mb-8">
      <div className="relative overflow-hidden rounded-2xl h-[200px] sm:h-[220px]">
        {/* Layered radial gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 30%, hsl(var(--primary) / 0.25) 0%, transparent 70%),
              radial-gradient(ellipse 40% 70% at 15% 80%, hsl(var(--primary) / 0.3) 0%, transparent 55%),
              radial-gradient(ellipse 50% 35% at 85% 15%, hsl(var(--primary) / 0.12) 0%, transparent 50%),
              linear-gradient(160deg, hsl(0 0% 4%) 0%, hsl(30 15% 5%) 50%, hsl(0 0% 3%) 100%)
            `,
          }}
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '180px',
          }}
        />

        {/* Geometric accent lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-[40px] right-[100px] w-px h-[250px]"
            style={{
              background: 'linear-gradient(180deg, transparent, hsl(var(--primary) / 0.35), transparent)',
              transform: 'rotate(18deg)',
            }}
          />
          <div
            className="absolute top-[30px] right-[60px] w-px h-[180px]"
            style={{
              background: 'linear-gradient(180deg, transparent, hsl(var(--primary) / 0.15), transparent)',
              transform: 'rotate(18deg)',
            }}
          />
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 50%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 animate-fade-in">
          {forgeMode === 'PRE_FORGE' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center animate-[fade-in_0.5s_ease-out]"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.25))',
                  boxShadow: '0 0 0 4px hsl(var(--primary) / 0.1), 0 0 24px hsl(var(--primary) / 0.15)',
                }}
              >
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-primary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Forge begins soon
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Get Ready for <span className="text-primary">{cohortName}</span>
                </h1>
                <p className="text-sm text-muted-foreground">Prepare for the experience of a lifetime</p>
              </div>
            </>
          )}

          {forgeMode === 'DURING_FORGE' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.35))',
                  boxShadow: '0 0 0 4px hsl(var(--primary) / 0.15), 0 0 32px hsl(var(--primary) / 0.25)',
                }}
              >
                <Star className="w-6 h-6 text-primary fill-primary" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-primary font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Forge is live
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  <span className="text-primary">{cohortName}</span> Journey
                </h1>
                <p className="text-sm text-muted-foreground">You're creating something amazing</p>
              </div>
            </>
          )}

          {forgeMode === 'POST_FORGE' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.3))',
                  boxShadow: '0 0 0 4px hsl(var(--primary) / 0.12), 0 0 40px hsl(var(--primary) / 0.2)',
                }}
              >
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-primary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Forge complete
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  <span className="text-primary">{cohortName}</span> Legacy
                </h1>
                <p className="text-sm text-muted-foreground">Look back at what you accomplished</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapHero;
