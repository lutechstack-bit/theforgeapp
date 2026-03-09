import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoPersonalTileProps {
  kyData?: any;
  kywResponse?: any;
  onEdit?: () => void;
}

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground">{label}</span>
    <span className={`text-[13px] ${value ? 'text-foreground' : 'text-muted-foreground/50 italic'}`}>
      {value || 'Not set'}
    </span>
  </div>
);

export const BentoPersonalTile: React.FC<BentoPersonalTileProps> = ({ kyData, kywResponse, onEdit }) => {
  const dob = kyData?.date_of_birth;
  const formattedDob = dob ? new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const language = kyData?.languages_known?.join(', ') || kywResponse?.primary_language;

  return (
    <BentoTile
      label="Personal Details"
      icon="◐"
      className="col-span-full md:col-span-5 row-span-2"
      onEdit={onEdit}
      animationDelay={0.36}
    >
      <div className="grid grid-cols-3 gap-4">
        <InfoRow label="Date of Birth" value={formattedDob} />
        <InfoRow label="Age" value={kyData?.age ? `${kyData.age}` : null} />
        <InfoRow label="Primary Language" value={language} />
      </div>
    </BentoTile>
  );
};
