import React from 'react';

interface ProgramBannerProps {
  label?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaUrl: string;
  gradient: string;
  imageUrl?: string;
}

export const ProgramBanner: React.FC<ProgramBannerProps> = ({
  label = 'LEVELUP PROGRAM',
  title,
  description,
  ctaText = 'REQUEST INVITE',
  ctaUrl,
  gradient,
  imageUrl,
}) => {
  const handleCta = () => {
    window.open(ctaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[240px] flex flex-col items-center justify-center text-center p-6 sm:p-8"
      style={{
        background: imageUrl
          ? `linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%), url(${imageUrl}) center/cover no-repeat`
          : gradient,
      }}
    >
      <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-white/70 mb-2">
        {label}
      </span>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-white/70 max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      <button
        onClick={handleCta}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-[hsl(36,88%,44%)] text-primary-foreground text-sm font-bold tracking-wide transition-all hover:opacity-90 active:scale-[0.97]"
      >
        {ctaText}
      </button>
    </div>
  );
};
