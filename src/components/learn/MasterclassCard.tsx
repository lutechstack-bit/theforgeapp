import React from 'react';

interface MasterclassCardProps {
  imageUrl: string;
  externalUrl: string;
  name: string;
}

export const MasterclassCard: React.FC<MasterclassCardProps> = ({
  imageUrl,
  externalUrl,
  name,
}) => {
  const handleClick = () => {
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleClick}
      className="w-[200px] sm:w-[220px] flex-shrink-0 rounded-2xl overflow-hidden border border-border/30 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
};
