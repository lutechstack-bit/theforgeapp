import React from 'react';
import { BentoTile } from './BentoTile';

interface BentoMBTITileProps {
  mbtiType?: string | null;
  onEdit?: () => void;
}

const MBTI_NAMES: Record<string, string> = {
  INFJ: 'The Advocate', INFP: 'The Mediator', INTJ: 'The Architect', INTP: 'The Logician',
  ISFJ: 'The Defender', ISFP: 'The Adventurer', ISTJ: 'The Logistician', ISTP: 'The Virtuoso',
  ENFJ: 'The Protagonist', ENFP: 'The Campaigner', ENTJ: 'The Commander', ENTP: 'The Debater',
  ESFJ: 'The Consul', ESFP: 'The Entertainer', ESTJ: 'The Executive', ESTP: 'The Entrepreneur',
};

const MBTI_TRAITS: Record<string, string> = {
  I: 'Introverted', E: 'Extraverted', S: 'Sensing', N: 'Intuitive',
  T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving',
};

export const BentoMBTITile: React.FC<BentoMBTITileProps> = ({ mbtiType, onEdit }) => {
  const type = mbtiType?.toUpperCase() || '';
  const name = MBTI_NAMES[type] || '';
  const traits = type.split('').map(c => MBTI_TRAITS[c]).filter(Boolean).join(' · ');

  return (
    <BentoTile
      label="Personality"
      icon="◬"
      className="col-span-full md:col-span-5 row-span-4"
      onEdit={onEdit}
      animationDelay={0.16}
    >
      {type ? (
        <div>
          <div className="font-serif text-5xl sm:text-6xl font-bold text-primary tracking-tighter leading-none mb-2">
            {type}
          </div>
          {name && <div className="text-sm text-foreground mb-1">{name}</div>}
          {traits && <div className="text-xs text-muted-foreground">{traits}</div>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">MBTI type not set</p>
      )}
    </BentoTile>
  );
};
