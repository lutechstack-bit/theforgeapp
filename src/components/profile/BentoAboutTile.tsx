import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoAboutTileProps {
  bio?: string | null;
  isOwner: boolean;
  onEdit?: () => void;
}

export const BentoAboutTile: React.FC<BentoAboutTileProps> = ({ bio, isOwner, onEdit }) => {
  return (
    <BentoTile
      label="About"
      icon="✦"
      className="col-span-full md:col-span-8 row-span-3"
      onEdit={isOwner ? onEdit : undefined}
      animationDelay={0.04}
    >
      {bio ? (
        <p className="font-serif text-base sm:text-lg font-light leading-relaxed text-muted-foreground italic">
          {bio}
        </p>
      ) : (
        <p className="font-serif text-sm text-muted-foreground/60 italic">
          Add a bio to tell your story...
        </p>
      )}
    </BentoTile>
  );
};
