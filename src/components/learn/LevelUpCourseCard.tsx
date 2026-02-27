import React from 'react';

interface LevelUpCourseCardProps {
  imageUrl: string;
  externalUrl?: string;
}

const LevelUpCourseCard: React.FC<LevelUpCourseCardProps> = ({ imageUrl, externalUrl }) => {
  const content = (
    <div className="w-[calc(100vw-48px)] sm:w-[280px] flex-shrink-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300">
    <div className="aspect-[4/5] rounded-[13px] overflow-hidden relative group cursor-pointer">
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    </div>
  );

  if (externalUrl) {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

export default LevelUpCourseCard;
