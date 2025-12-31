import React, { useMemo, useEffect, useRef, useState } from 'react';

interface SmoothPathProps {
  nodeCount: number;
  getNodePosition: (index: number) => 'left' | 'center' | 'right';
  nodeStatuses: ('completed' | 'current' | 'upcoming' | 'locked')[];
  containerWidth?: number;
  scrollProgress?: number;
}

const SmoothPath: React.FC<SmoothPathProps> = ({ 
  nodeCount, 
  getNodePosition,
  nodeStatuses,
  containerWidth = 400,
  scrollProgress = 0
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  if (nodeCount < 2) return null;

  const nodeSpacing = 180;
  const totalHeight = (nodeCount - 1) * nodeSpacing + 120;
  const padding = 50;

  const getX = (pos: 'left' | 'center' | 'right') => {
    if (pos === 'left') return padding + 40;
    if (pos === 'right') return containerWidth - padding - 40;
    return containerWidth / 2;
  };

  const pathData = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = getNodePosition(i);
      points.push({
        x: getX(pos),
        y: i * nodeSpacing + 60
      });
    }

    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midY = (current.y + next.y) / 2;
      
      // S-curve using cubic bezier
      const cp1x = current.x;
      const cp1y = midY;
      const cp2x = next.x;
      const cp2y = midY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  }, [nodeCount, getNodePosition, containerWidth]);

  // Measure the actual path length after render
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [pathData]);

  const dashOffset = pathLength * (1 - scrollProgress);

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${containerWidth} ${totalHeight}`}
      preserveAspectRatio="xMidYMin slice"
      style={{ minHeight: totalHeight }}
    >
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.9" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background dotted path - visible dots */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="3"
        strokeDasharray="4 14"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Hidden path for measuring */}
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="0"
      />

      {/* Active revealed path - solid with glow */}
      {pathLength > 0 && (
        <path
          d={pathData}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          filter="url(#pathGlow)"
          style={{ 
            transition: 'stroke-dashoffset 0.2s ease-out',
          }}
        />
      )}

      {/* Traveling dot at the edge of revealed path */}
      {scrollProgress > 0.02 && pathLength > 0 && (
        <g filter="url(#dotGlow)">
          {/* Outer glow circle */}
          <circle 
            r="8" 
            fill="hsl(var(--primary))"
          >
            <animateMotion
              dur="0.001s"
              fill="freeze"
              path={pathData}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          
          {/* Inner bright core */}
          <circle 
            r="4" 
            fill="hsl(var(--primary-foreground))"
            opacity="0.9"
          >
            <animateMotion
              dur="0.001s"
              fill="freeze"
              path={pathData}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          
          {/* Pulsing outer ring */}
          <circle 
            r="12" 
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.5"
          >
            <animateMotion
              dur="0.001s"
              fill="freeze"
              path={pathData}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
            <animate
              attributeName="r"
              values="8;16;8"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.1;0.6"
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