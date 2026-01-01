import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LearnCourseCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  instructorName?: string;
  companyName?: string;
  companyLogoUrl?: string;
  isPremium?: boolean;
  onClick?: () => void;
}

export const LearnCourseCard: React.FC<LearnCourseCardProps> = ({
  id,
  title,
  subtitle,
  thumbnailUrl,
  instructorName,
  companyName,
  companyLogoUrl,
  isPremium,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/learn/${id}`);
    }
  };

  // Split title for styling (first word italic, rest bold)
  const titleParts = title.split(' ');
  const firstWord = titleParts[0];
  const restOfTitle = titleParts.slice(1).join(' ');

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] min-w-[200px] md:min-w-[240px] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
            Premium
          </span>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
        {/* Title - styled like reference */}
        <div className="mb-3">
          {firstWord && restOfTitle ? (
            <>
              <span className="text-white/90 italic text-lg font-light block leading-tight">
                {firstWord}
              </span>
              <span className="text-white font-bold text-xl uppercase tracking-wide leading-tight">
                {restOfTitle}
              </span>
            </>
          ) : (
            <span className="text-white font-bold text-xl uppercase tracking-wide leading-tight">
              {title}
            </span>
          )}
        </div>

        {/* Instructor Info */}
        {(instructorName || companyName) && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 w-fit border border-white/10">
            <span className="text-white text-sm font-medium">
              {instructorName}
            </span>
            {companyName && (
              <>
                {companyLogoUrl ? (
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="h-4 w-auto object-contain"
                  />
                ) : (
                  <span className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded">
                    {companyName}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-primary/10" />
      </div>
    </div>
  );
};
