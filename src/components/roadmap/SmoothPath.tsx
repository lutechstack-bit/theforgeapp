import React from 'react';

interface SmoothPathProps {
  nodeCount: number;
  getNodePosition: (index: number) => 'left' | 'center' | 'right';
  nodeStatuses: ('completed' | 'current' | 'upcoming' | 'locked')[];
  containerWidth?: number;
  scrollProgress?: number; // 0 to 1
}

const SmoothPath: React.FC<SmoothPathProps> = ({ 
  nodeCount, 
  getNodePosition,
  nodeStatuses,
  containerWidth = 400,
  scrollProgress = 0
}) => {
  if (nodeCount < 2) return null;

  const nodeSpacing = 160;
  const totalHeight = (nodeCount - 1) * nodeSpacing + 100;
  const padding = 60;

  const getX = (pos: 'left' | 'center' | 'right') => {
    if (pos === 'left') return padding + 32;
    if (pos === 'right') return containerWidth - padding - 32;
    return containerWidth / 2;
  };

  const generatePath = () => {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = getNodePosition(i);
      points.push({
        x: getX(pos),
        y: i * nodeSpacing + 50
      });
    }

    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midY = (current.y + next.y) / 2;
      const cp1x = current.x;
      const cp1y = midY;
      const cp2x = next.x;
      const cp2y = midY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  const pathD = generatePath();
  
  // Use scroll progress for the path reveal (0-100%) with smooth animation
  const progressPercent = Math.min(scrollProgress * 100, 100);

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${containerWidth} ${totalHeight}`}
      preserveAspectRatio="xMidYMin slice"
      style={{ minHeight: totalHeight }}
    >
      <defs>
        <linearGradient id="smoothPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        
        <filter id="smoothPathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id="progressMask">
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height={`${progressPercent}%`}
            fill="white"
          >
            <animate 
              attributeName="height"
              to={`${progressPercent}%`}
              dur="0.15s"
              fill="freeze"
            />
          </rect>
        </mask>
      </defs>

      {/* Background dotted path - always visible but subtle */}
      <path
        d={pathD}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="4"
        strokeDasharray="8 16"
        strokeLinecap="round"
        opacity="0.25"
      />
      
      {/* Active path revealed by scroll with smooth transition */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#smoothPathGradient)"
        strokeWidth="5"
        strokeDasharray="8 16"
        strokeLinecap="round"
        filter="url(#smoothPathGlow)"
        mask="url(#progressMask)"
        style={{ 
          transition: 'stroke-dashoffset 0.2s ease-out',
        }}
      />

      {/* Traveling dot at the edge of revealed path */}
      {progressPercent > 0 && (
        <g style={{ transition: 'transform 0.15s ease-out' }}>
          <circle 
            r="8" 
            fill="hsl(var(--primary))"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
          >
            <animateMotion
              dur="0.01s"
              fill="freeze"
              path={pathD}
              keyPoints={`${Math.min(scrollProgress, 1)};${Math.min(scrollProgress, 1)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          {/* Inner glow */}
          <circle 
            r="4" 
            fill="hsl(var(--primary-foreground))"
            opacity="0.9"
          >
            <animateMotion
              dur="0.01s"
              fill="freeze"
              path={pathD}
              keyPoints={`${Math.min(scrollProgress, 1)};${Math.min(scrollProgress, 1)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default SmoothPath;