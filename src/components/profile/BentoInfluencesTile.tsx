import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoInfluencesTileProps {
  cohortType: string | null;
  kyfResponse?: any;
  kywResponse?: any;
  kyData?: any;
  onEdit?: () => void;
}

export const BentoInfluencesTile: React.FC<BentoInfluencesTileProps> = ({
  cohortType,
  kyfResponse,
  kywResponse,
  kyData,
  onEdit,
}) => {
  const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';
  const items = isFilmmaking ? kyfResponse?.top_3_movies : kywResponse?.top_3_writers_books;
  const prefix = isFilmmaking ? '🎬' : '📖';
  const chronotype = kyData?.chronotype;

  return (
    <BentoTile
      label="Influences"
      icon="◻"
      className="col-span-full md:col-span-5 row-span-3"
      onEdit={onEdit}
      animationDelay={0.24}
    >
      <div className="space-y-4">
        {items && items.length > 0 && (
          <div>
            <div className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground mb-2">
              {isFilmmaking ? 'Top 3 Movies' : 'Top 3 Writers / Books'}
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary border border-primary/10 text-muted-foreground"
                >
                  {prefix} {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {chronotype && (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground">Chronotype</span>
            <span className="text-[13px] text-foreground">
              {chronotype.toLowerCase().includes('night') ? '🌙' : '☀️'} {chronotype}
            </span>
          </div>
        )}

        {!items?.length && !chronotype && (
          <p className="text-sm text-muted-foreground/50 italic">Complete your KY form to see influences</p>
        )}
      </div>
    </BentoTile>
  );
};
