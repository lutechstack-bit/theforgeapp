import React from 'react';

interface LevelUpCourseCardProps {
  imageUrl: string;
  tags?: string[];
  title: string;
  accentText: string;
  instructorName: string;
  instructorSubtitle: string;
  externalUrl?: string;
}

const LevelUpCourseCard: React.FC<LevelUpCourseCardProps> = ({
  imageUrl,
  tags = [],
  title,
  accentText,
  instructorName,
  instructorSubtitle,
  externalUrl,
}) => {
  // Split title around accent text
  const parts = title.split(accentText);
  const before = parts[0] || '';
  const after = parts[1] || '';

  const content = (
    <div className="relative w-[260px] sm:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer">
      {/* Background image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top: tags + wave icon */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-white/15 text-white/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Wave icon */}
          <svg
            className="w-6 h-6 text-white/30 flex-shrink-0 ml-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 12c2-3 4-4 6-1s4 2 6-1 4-2 6 1" strokeLinecap="round" />
            <path d="M2 17c2-3 4-4 6-1s4 2 6-1 4-2 6 1" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>

        {/* Bottom: title + instructor */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {before}
            <span className="text-amber-400">{accentText}</span>
            {after}
          </h3>

          <div className="w-full h-px bg-white/20" />

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{instructorName}</p>
              <p className="text-[10px] text-white/60 truncate">{instructorSubtitle}</p>
            </div>
            {/* LevelUp logo text */}
            <span className="text-[9px] font-bold tracking-wider text-white/40 uppercase whitespace-nowrap flex-shrink-0">
              LevelUp
            </span>
          </div>
        </div>
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
