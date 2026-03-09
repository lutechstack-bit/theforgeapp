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
      className="col-span-full md:col-span-8"
      onEdit={isOwner ? onEdit : undefined}
      animationDelay={0.04}
    >
      {bio ? (
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          {bio}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/60">
          Add a bio to tell your story...
        </p>
      )}
    </BentoTile>
  );
};
