import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoGeneralTileProps {
  kyData: any;
  cohortType: string | null;
  onEdit?: () => void;
}

const InfoRow: React.FC<{ label: string; value?: string | null; gold?: boolean }> = ({ label, value, gold }) => (
  <div className="flex flex-col gap-0.5 mb-3 last:mb-0">
    <span className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground">{label}</span>
    <span className={`text-[13.5px] font-normal ${value ? (gold ? 'text-primary font-medium' : 'text-foreground') : 'text-muted-foreground/50 italic'}`}>
      {value || 'Not set'}
    </span>
  </div>
);

export const BentoGeneralTile: React.FC<BentoGeneralTileProps> = ({ kyData, cohortType, onEdit }) => {
  return (
    <BentoTile
      label="General Details"
      icon="◎"
      className="col-span-full md:col-span-4 row-span-3"
      onEdit={onEdit}
      animationDelay={0.08}
    >
      <InfoRow label="Certificate Name" value={kyData?.certificate_name} />
      <InfoRow
        label="Occupation"
        value={kyData?.current_occupation || kyData?.current_status}
      />
      <InfoRow label="Instagram" value={kyData?.instagram_id ? `@${kyData.instagram_id.replace('@', '')}` : null} gold />
    </BentoTile>
  );
};
