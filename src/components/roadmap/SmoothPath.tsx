import React from 'react';

interface SmoothPathProps {
  nodeCount: number;
  getNodePosition: (index: number) => 'left' | 'center' | 'right';
  nodeStatuses: ('completed' | 'current' | 'upcoming' | 'locked')[];
  containerWidth?: number;
}

const SmoothPath: React.FC<SmoothPathProps> = ({ 
  nodeCount, 
  getNodePosition,
  nodeStatuses,
  containerWidth = 400
}) => {
  if (nodeCount < 2) return null;

  const nodeSpacing = 160; // Vertical spacing between nodes
  const totalHeight = (nodeCount - 1) * nodeSpacing + 100;
  const padding = 60;

  // Get x position based on node position
  const getX = (pos: 'left' | 'center' | 'right') => {
    if (pos === 'left') return padding + 32;
    if (pos === 'right') return containerWidth - padding - 32;
    return containerWidth / 2;
  };

  // Generate smooth cubic bezier path
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

    // Create smooth path using cubic beziers
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth S-curves
      const midY = (current.y + next.y) / 2;
      
      // Control point 1: horizontal from current point
      const cp1x = current.x;
      const cp1y = midY;
      
      // Control point 2: horizontal toward next point
      const cp2x = next.x;
      const cp2y = midY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  // Calculate path length for animation
  const pathD = generatePath();
  
  // Find current node index for progress
  const currentIndex = nodeStatuses.findIndex(s => s === 'current');
  const completedCount = nodeStatuses.filter(s => s === 'completed').length;
  const progressIndex = currentIndex >= 0 ? currentIndex : 
    (nodeStatuses.every(s => s === 'completed') ? nodeCount : completedCount);
  const progressPercent = nodeCount > 1 ? (progressIndex / (nodeCount - 1)) * 100 : 0;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${containerWidth} ${totalHeight}`}
      preserveAspectRatio="xMidYMin slice"
      style={{ minHeight: totalHeight }}
    >
      <defs>
        {/* Gradient for active path */}
        <linearGradient id="smoothPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="smoothPathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Mask for progress */}
        <mask id="progressMask">
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height={`${progressPercent}%`}
            fill="white"
            className="transition-all duration-700 ease-out"
          />
        </mask>
      </defs>

      {/* Background dotted path */}
      <path
        d={pathD}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="4"
        strokeDasharray="8 16"
        strokeLinecap="round"
        opacity="0.3"
      />
      
      {/* Active/completed path with glow */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#smoothPathGradient)"
        strokeWidth="4"
        strokeDasharray="8 16"
        strokeLinecap="round"
        filter="url(#smoothPathGlow)"
        mask="url(#progressMask)"
      />

      {/* Animated traveling dot */}
      {progressPercent > 0 && currentIndex >= 0 && (
        <circle 
          r="6" 
          fill="hsl(var(--primary))"
          className="animate-pulse-soft"
        >
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path={pathD}
            keyPoints={`${Math.max(0, (progressIndex - 0.5) / (nodeCount - 1))};${progressIndex / (nodeCount - 1)}`}
            keyTimes="0;1"
            calcMode="linear"
          />
        </circle>
      )}

      {/* Decorative dots along path */}
      {nodeStatuses.map((status, index) => {
        if (index === nodeCount - 1) return null;
        const pos = getNodePosition(index);
        const nextPos = getNodePosition(index + 1);
        const x1 = getX(pos);
        const x2 = getX(nextPos);
        const y1 = index * nodeSpacing + 50;
        const y2 = (index + 1) * nodeSpacing + 50;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        const isActive = status === 'completed' || status === 'current';
        
        return (
          <circle
            key={`dot-${index}`}
            cx={midX}
            cy={midY}
            r="3"
            fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            opacity={isActive ? 0.8 : 0.4}
            className={isActive ? 'animate-pulse-soft' : ''}
          />
        );
      })}
    </svg>
  );
};

export default SmoothPath;