import React from 'react';

interface SerpentinePathProps {
  nodeCount: number;
  scrollProgress: number;
  nodeStatuses: ('completed' | 'current' | 'upcoming' | 'locked')[];
}

const SerpentinePath: React.FC<SerpentinePathProps> = ({ 
  nodeCount, 
  scrollProgress,
  nodeStatuses 
}) => {
  if (nodeCount < 2) return null;

  const nodeHeight = 140; // Height per node row
  const totalHeight = (nodeCount - 1) * nodeHeight + 100;
  const pathWidth = 280; // Width of serpentine pattern
  
  // Generate serpentine path points
  const generatePath = () => {
    const points: string[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const y = i * nodeHeight + 50;
      const row = i % 3; // 0 = left, 1 = center, 2 = right
      
      let x: number;
      if (row === 0) x = 50;
      else if (row === 1) x = pathWidth / 2;
      else x = pathWidth - 50;
      
      if (i === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        const prevRow = (i - 1) % 3;
        let prevX: number;
        if (prevRow === 0) prevX = 50;
        else if (prevRow === 1) prevX = pathWidth / 2;
        else prevX = pathWidth - 50;
        
        const prevY = (i - 1) * nodeHeight + 50;
        const midY = (prevY + y) / 2;
        
        // Create smooth bezier curve
        points.push(`C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`);
      }
    }
    
    return points.join(' ');
  };

  const pathD = generatePath();
  
  // Calculate which segments are completed
  const completedIndex = nodeStatuses.findIndex(s => s === 'current');
  const completedProgress = completedIndex >= 0 
    ? (completedIndex / (nodeCount - 1)) 
    : nodeStatuses.every(s => s === 'completed') ? 1 : 0;

  return (
    <svg 
      className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
      width={pathWidth}
      height={totalHeight}
      viewBox={`0 0 ${pathWidth} ${totalHeight}`}
    >
      <defs>
        {/* Gradient for active path */}
        <linearGradient id="activePathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Dotted pattern */}
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="2" fill="hsl(var(--border))" opacity="0.5" />
        </pattern>
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
        stroke="url(#activePathGradient)"
        strokeWidth="4"
        strokeDasharray="8 16"
        strokeLinecap="round"
        filter="url(#pathGlow)"
        strokeDashoffset="0"
        style={{
          clipPath: `inset(0 0 ${(1 - completedProgress) * 100}% 0)`,
          transition: 'clip-path 0.5s ease-out'
        }}
      />

      {/* Animated dots along completed path */}
      {completedProgress > 0 && (
        <circle r="4" fill="hsl(var(--primary))">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={pathD}
            keyPoints={`0;${completedProgress}`}
            keyTimes="0;1"
          />
        </circle>
      )}
    </svg>
  );
};

export default SerpentinePath;