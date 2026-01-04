import React from 'react';
import { cn } from '@/lib/utils';
import { Mentor } from '@/data/mentorsData';

interface PremiumMentorCardProps {
  mentor: Mentor;
  onClick?: () => void;
  className?: string;
}

export const PremiumMentorCard: React.FC<PremiumMentorCardProps> = ({
  mentor,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative min-w-[200px] sm:min-w-[220px] md:min-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group",
        "bg-card border border-border/50",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30",
        "hover:-translate-y-2 hover:scale-[1.02]",
        className
      )}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={mentor.imageUrl}
          alt={mentor.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
        />
      </div>

      {/* Premium Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {/* Name */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight mb-1.5 transition-colors duration-300 group-hover:text-primary">
          {mentor.name}
        </h3>

        {/* Roles */}
        <p className="text-xs text-muted-foreground/80 font-medium uppercase tracking-wide line-clamp-2">
          {mentor.roles.slice(0, 2).join(' • ')}
        </p>

        {/* Brands preview - shown on hover */}
        <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
          {mentor.brands.slice(0, 3).map((brand, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full"
            >
              {brand.name}
            </span>
          ))}
          {mentor.brands.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full">
              +{mentor.brands.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Premium corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent transform rotate-45 translate-x-8 -translate-y-8 group-hover:from-primary/40 transition-colors duration-500" />
      </div>
    </div>
  );
};
