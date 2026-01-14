import React from 'react';

type NodeStatus = 'completed' | 'current' | 'upcoming' | 'locked';
type ForgeMode = 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';

// Simplified inline timeline that works with absolute positioning
export const TimelineNode: React.FC<{ 
  status: NodeStatus; 
  isFirst: boolean; 
  isLast: boolean;
  prevStatus?: NodeStatus;
  forgeMode?: ForgeMode;
  isHighlighted?: boolean;
}> = ({ status, isFirst, isLast, prevStatus, forgeMode = 'DURING_FORGE', isHighlighted = false }) => {
  
  const getNodeStyles = () => {
    // PRE_FORGE: All nodes are muted/preview style
    if (forgeMode === 'PRE_FORGE') {
      return 'bg-transparent border-muted/40 border-2';
    }
    
    // POST_FORGE: All nodes are completed (gold filled)
    if (forgeMode === 'POST_FORGE') {
      return 'bg-primary border-primary';
    }
    
    // DURING_FORGE: Status-based styling
    switch (status) {
      case 'completed':
        return 'bg-primary border-primary';
      case 'current':
        return 'bg-primary border-primary ring-4 ring-primary/30';
      case 'upcoming':
        return 'bg-transparent border-primary/50 border-2';
      case 'locked':
        return 'bg-transparent border-muted/40 border-2';
      default:
        return 'bg-transparent border-muted/40 border-2';
    }
  };

  const getLineStyles = (isPrevLine: boolean) => {
    // PRE_FORGE: All lines are muted dashed with hover effect
    if (forgeMode === 'PRE_FORGE') {
      return `border-l-2 border-dashed ${isHighlighted ? 'border-primary/50 timeline-hover-active' : 'border-muted/30'}`;
    }
    
    // POST_FORGE: Gold lines with hover effect
    if (forgeMode === 'POST_FORGE') {
      return isHighlighted ? 'bg-primary/70 timeline-hover-active-gold' : 'bg-primary';
    }
    
    // DURING_FORGE: Based on status
    if (isPrevLine) {
      // Line above node - check if previous was completed
      if (prevStatus === 'completed') {
        return isHighlighted ? 'bg-primary/80 timeline-hover-active-gold' : 'bg-primary';
      }
      return `border-l-2 border-dashed ${isHighlighted ? 'border-primary/50 timeline-hover-active' : 'border-muted/30'}`;
    } else {
      // Line below node - check if current is completed
      if (status === 'completed') {
        return isHighlighted ? 'bg-primary/80 timeline-hover-active-gold' : 'bg-primary';
      }
      return `border-l-2 border-dashed ${isHighlighted ? 'border-primary/50 timeline-hover-active' : 'border-muted/30'}`;
    }
  };

  return (
    <div className="flex flex-col items-center w-3 h-full">
      {/* Top line segment */}
      {!isFirst && (
        <div 
          className={`
            w-0.5 flex-1 min-h-[16px] transition-all duration-500
            ${getLineStyles(true)}
          `}
        />
      )}
      
      {/* Node circle */}
      <div className="relative flex-shrink-0">
        <div 
          className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${getNodeStyles()}
          `}
        />
        {status === 'current' && forgeMode === 'DURING_FORGE' && (
          <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-pulse-soft" />
        )}
      </div>
      
      {/* Bottom line segment */}
      {!isLast && (
        <div 
          className={`
            w-0.5 flex-1 min-h-[16px] transition-all duration-500
            ${getLineStyles(false)}
          `}
        />
      )}
    </div>
  );
};

export default TimelineNode;
