import React from 'react';

interface LevelUpCourseCardProps {
  imageUrl: string;
  externalUrl?: string;
}

const LevelUpCourseCard: React.FC<LevelUpCourseCardProps> = ({ imageUrl, externalUrl }) => {
  const content = (
    <div className="w-[260px] sm:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer">
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
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
