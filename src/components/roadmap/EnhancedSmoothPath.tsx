import React, { useMemo, useEffect, useRef, useState } from 'react';

interface EnhancedSmoothPathProps {
  nodeCount: number;
  getNodePosition: (index: number) => 'left' | 'center' | 'right';
  nodeStatuses: ('completed' | 'current' | 'upcoming' | 'locked')[];
  containerWidth?: number;
  scrollProgress?: number;
}

const EnhancedSmoothPath: React.FC<EnhancedSmoothPathProps> = ({ 
  nodeCount, 
  getNodePosition,
  nodeStatuses,
  containerWidth = 400,
  scrollProgress = 0
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  if (nodeCount < 2) return null;

  const nodeSpacing = 160;
  const totalHeight = (nodeCount - 1) * nodeSpacing + 140;
  const padding = 60;

  const getX = (pos: 'left' | 'center' | 'right') => {
    if (pos === 'left') return padding + 50;
    if (pos === 'right') return containerWidth - padding - 50;
    return containerWidth / 2;
  };

  const pathData = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = getNodePosition(i);
      points.push({
        x: getX(pos),
        y: i * nodeSpacing + 70
      });
    }

    if (points.length < 2) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midY = (current.y + next.y) / 2;
      
      // Smoother S-curve
      const tension = 0.8;
      const cp1x = current.x;
      const cp1y = current.y + (midY - current.y) * tension;
      const cp2x = next.x;
      const cp2y = next.y - (next.y - midY) * tension;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  }, [nodeCount, getNodePosition, containerWidth]);

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
        {/* Enhanced gradient */}
        <linearGradient id="enhancedPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        </linearGradient>
        
        {/* Stronger glow */}
        <filter id="enhancedPathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Dot glow */}
        <filter id="enhancedDotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="1" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animated gradient for particles */}
        <linearGradient id="particleGradient">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background path - elegant dots */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        strokeDasharray="2 16"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Subtle guide line */}
      <path
        d={pathData}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="1"
        opacity="0.2"
      />
      
      {/* Hidden path for measuring */}
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="0"
      />

      {/* Active path with glow */}
      {pathLength > 0 && (
        <>
          {/* Outer glow layer */}
          <path
            d={pathData}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            opacity="0.3"
            style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
          />
          
          {/* Main path */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#enhancedPathGradient)"
            strokeWidth="3"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter="url(#enhancedPathGlow)"
            style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
          />
        </>
      )}

      {/* Traveling dot */}
      {scrollProgress > 0.01 && pathLength > 0 && (
        <g filter="url(#enhancedDotGlow)">
          {/* Outer pulse ring */}
          <circle r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.3">
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
              values="10;20;10"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.1;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Main glow */}
          <circle r="10" fill="hsl(var(--primary))">
            <animateMotion
              dur="0.001s"
              fill="freeze"
              path={pathData}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          
          {/* Bright core */}
          <circle r="5" fill="hsl(var(--primary-foreground))">
            <animateMotion
              dur="0.001s"
              fill="freeze"
              path={pathData}
              keyPoints={`${Math.min(scrollProgress, 0.999)};${Math.min(scrollProgress, 0.999)}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default EnhancedSmoothPath;
