import React, { useMemo } from 'react';

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

  const pathData = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = getNodePosition(i);
      points.push({
        x: getX(pos),
        y: i * nodeSpacing + 50
      });
    }

    if (points.length < 2) return { path: '', length: 0 };

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

    // Estimate path length (rough calculation)
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      length += Math.sqrt(dx * dx + dy * dy) * 1.2; // 1.2 factor for curves
    }

    return { path, length };
  }, [nodeCount, getNodePosition, containerWidth]);

  const { path: pathD, length: estimatedLength } = pathData;
  
  // Calculate stroke-dashoffset based on scroll progress
  // Full length = hidden, 0 = fully visible
  const dashOffset = estimatedLength * (1 - scrollProgress);

  // Calculate dot position based on scroll progress
  const dotY = scrollProgress * (totalHeight - 100) + 50;

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
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background dotted path - always visible but subtle */}
      <path
        d={pathD}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="3"
        strokeDasharray="6 12"
        strokeLinecap="round"
        opacity="0.3"
      />
      
      {/* Active path revealed by scroll - using stroke-dashoffset technique */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#smoothPathGradient)"
        strokeWidth="4"
        strokeDasharray={estimatedLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        filter="url(#smoothPathGlow)"
        style={{ 
          transition: 'stroke-dashoffset 0.15s ease-out',
        }}
      />

      {/* Traveling dot at the edge of revealed path */}
      {scrollProgress > 0.01 && (
        <g filter="url(#dotGlow)">
          <circle 
            cx={containerWidth / 2}
            cy={dotY}
            r="10" 
            fill="hsl(var(--primary))"
            style={{ 
              transition: 'cy 0.15s ease-out',
            }}
          >
            <animateMotion
              dur="0.2s"
              fill="freeze"
              path={pathD}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
              restart="always"
            />
          </circle>
          {/* Inner bright core */}
          <circle 
            r="5" 
            fill="hsl(var(--primary-foreground))"
            opacity="0.95"
          >
            <animateMotion
              dur="0.2s"
              fill="freeze"
              path={pathD}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
              restart="always"
            />
          </circle>
          {/* Pulsing ring */}
          <circle 
            r="14" 
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.4"
          >
            <animateMotion
              dur="0.2s"
              fill="freeze"
              path={pathD}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
              restart="always"
            />
            <animate
              attributeName="r"
              values="10;18;10"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.1;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default SmoothPath;