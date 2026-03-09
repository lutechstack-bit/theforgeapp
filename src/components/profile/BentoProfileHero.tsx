import React from 'react';
import { Edit2 } from 'lucide-react';

interface BentoProfileHeroProps {
  profile: any;
  edition: any;
  isOwner?: boolean;
  onEdit?: () => void;
}

const getCohortLabel = (edition: any) => {
  if (!edition) return null;
  const type = edition.cohort_type;
  const name = edition.name || '';
  if (type === 'FORGE') return `Forge Filmmaking · ${name}`;
  if (type === 'FORGE_WRITING') return `Forge Writing · ${name}`;
  if (type === 'FORGE_CREATORS') return `Forge Creators · ${name}`;
  return name;
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

export const BentoProfileHero: React.FC<BentoProfileHeroProps> = ({
  profile,
  edition,
  isOwner = false,
  onEdit,
}) => {
  const cohortLabel = getCohortLabel(edition);
  const fullName = profile?.full_name || 'Anonymous Creator';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <div className="relative h-[320px] sm:h-[360px] lg:h-[400px] overflow-hidden rounded-none -mx-4 sm:-mx-6 md:mx-0 md:rounded-2xl">
      {/* Animated layered background */}
      <div
        className="absolute inset-0 animate-[heroShift_12s_ease-in-out_infinite_alternate]"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 60% 40%, hsl(var(--primary) / 0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 20% 80%, hsl(var(--forge-gold) / 0.4) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 10%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
            linear-gradient(160deg, hsl(0 0% 4%) 0%, hsl(30 20% 5%) 40%, hsl(0 0% 3%) 100%)
          `,
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      {/* Geometric accent lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[60px] right-[120px] w-px h-[300px]"
          style={{
            background: 'linear-gradient(180deg, transparent, hsl(var(--primary) / 0.4), transparent)',
            transform: 'rotate(18deg)',
          }}
        />
        <div
          className="absolute top-[40px] right-[80px] w-px h-[220px]"
          style={{
            background: 'linear-gradient(180deg, transparent, hsl(var(--primary) / 0.2), transparent)',
            transform: 'rotate(18deg)',
          }}
        />
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[260px] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 40%, transparent 100%)',
        }}
      />

      {/* Hero content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6 animate-fade-in">
        {/* Avatar */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--forge-gold) / 0.2))',
            boxShadow: '0 0 0 5px hsl(var(--primary) / 0.12), 0 0 0 10px hsl(var(--primary) / 0.05), 0 12px 48px hsl(0 0% 0% / 0.7)',
          }}
          onClick={isOwner ? onEdit : undefined}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={fullName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-4xl sm:text-5xl font-semibold text-primary">
              {getInitials(fullName)}
            </span>
          )}
          {isOwner && (
            <div className="absolute bottom-0.5 right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center gap-2.5">
          {cohortLabel && (
            <div className="flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {cohortLabel}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-foreground">
            {firstName}
            {restName && <span className="text-primary"> {restName}</span>}
          </h1>

          {profile?.tagline && (
            <p className="text-sm text-muted-foreground max-w-md">
              "{profile.tagline}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
