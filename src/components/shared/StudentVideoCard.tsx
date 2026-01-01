import React from 'react';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface StudentVideoCardProps {
  name: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  companyLogos?: string[];
  onClick?: () => void;
  className?: string;
}

export const StudentVideoCard: React.FC<StudentVideoCardProps> = ({
  name,
  title,
  subtitle,
  imageUrl,
  companyLogos,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative min-w-[220px] sm:min-w-[260px] md:min-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 rounded-full bg-foreground/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {/* Title & Subtitle */}
        <div className="mb-3">
          {subtitle && (
            <p className="text-xs sm:text-sm italic text-foreground/70 mb-0.5">{subtitle}</p>
          )}
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight uppercase tracking-wide">
            {title}
          </h3>
        </div>

        {/* Name & Company Logos */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-foreground/80 font-medium">{name}</span>
          
          {companyLogos && companyLogos.length > 0 && (
            <div className="flex items-center gap-1.5">
              {companyLogos.slice(0, 2).map((logo, index) => (
                <div
                  key={index}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-foreground/90 flex items-center justify-center overflow-hidden"
                >
                  <img src={logo} alt="Company" className="w-full h-full object-contain p-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
