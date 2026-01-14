import React from 'react';

type NodeStatus = 'completed' | 'current' | 'upcoming' | 'locked';

interface TimelineSpineProps {
  nodeStatuses: NodeStatus[];
}

const TimelineSpine: React.FC<TimelineSpineProps> = ({ nodeStatuses }) => {
  const getNodeStyles = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-primary border-primary';
      case 'current':
        return 'bg-primary border-primary ring-4 ring-primary/30 scale-125';
      case 'upcoming':
        return 'bg-transparent border-primary/50';
      case 'locked':
        return 'bg-transparent border-muted/40';
      default:
        return 'bg-transparent border-muted/40';
    }
  };

  const getLineStyles = (status: NodeStatus, isBeforeNode: boolean) => {
    if (isBeforeNode) {
      // Line segment before the node (from previous)
      if (status === 'completed' || status === 'current') {
        return 'bg-primary';
      }
      return 'border-l-2 border-dashed border-muted/40 bg-transparent';
    } else {
      // Line segment after the node (to next)
      if (status === 'completed') {
        return 'bg-primary';
      }
      return 'border-l-2 border-dashed border-muted/40 bg-transparent';
    }
  };

  return (
    <div className="absolute left-6 top-0 bottom-0 flex flex-col items-center z-0">
      {nodeStatuses.map((status, index) => {
        const isFirst = index === 0;
        const isLast = index === nodeStatuses.length - 1;
        const prevStatus = index > 0 ? nodeStatuses[index - 1] : null;
        
        return (
          <div key={index} className="relative flex flex-col items-center" style={{ height: '100%' }}>
            {/* Line segment before node */}
            {!isFirst && (
              <div 
                className={`
                  w-0.5 flex-1 min-h-[40px]
                  ${prevStatus === 'completed' ? 'bg-primary' : 'border-l-2 border-dashed border-muted/40'}
                `}
              />
            )}
            
            {/* Node */}
            <div 
              className={`
                w-3 h-3 rounded-full border-2 flex-shrink-0 z-10 transition-all duration-300
                ${getNodeStyles(status)}
              `}
            >
              {status === 'current' && (
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
              )}
            </div>
            
            {/* Line segment after node */}
            {!isLast && (
              <div 
                className={`
                  w-0.5 flex-1 min-h-[40px]
                  ${status === 'completed' ? 'bg-primary' : 'border-l-2 border-dashed border-muted/40'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Simplified inline timeline that works with absolute positioning
export const TimelineNode: React.FC<{ 
  status: NodeStatus; 
  isFirst: boolean; 
  isLast: boolean;
  prevStatus?: NodeStatus;
}> = ({ status, isFirst, isLast, prevStatus }) => {
  const getNodeStyles = (status: NodeStatus) => {
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

  return (
    <div className="flex flex-col items-center w-3">
      {/* Top line segment */}
      {!isFirst && (
        <div 
          className={`
            w-0.5 h-8
            ${prevStatus === 'completed' ? 'bg-primary' : 'border-l-2 border-dashed border-muted/30'}
          `}
        />
      )}
      
      {/* Node circle */}
      <div className="relative">
        <div 
          className={`
            w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300
            ${getNodeStyles(status)}
          `}
        />
        {status === 'current' && (
          <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-pulse-soft" />
        )}
      </div>
      
      {/* Bottom line segment */}
      {!isLast && (
        <div 
          className={`
            w-0.5 h-8
            ${status === 'completed' ? 'bg-primary' : 'border-l-2 border-dashed border-muted/30'}
          `}
        />
      )}
    </div>
  );
};

export default TimelineSpine;
