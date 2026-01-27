import React from 'react';
import { RefreshCw, Check, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  onRefresh,
  children,
  className,
}) => {
  const {
    containerRef,
    pullDistance,
    isRefreshing,
    isComplete,
    threshold,
  } = usePullToRefresh({ onRefresh });

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center transition-opacity',
          'pointer-events-none z-10',
          pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          top: 0,
          height: Math.max(pullDistance, isRefreshing ? threshold : 0),
        }}
      >
        <div
          className={cn(
            'flex flex-col items-center gap-1 text-xs text-muted-foreground',
            'transition-all duration-200'
          )}
        >
          {isComplete ? (
            <>
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Updated!</span>
            </>
          ) : isRefreshing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span>Refreshing...</span>
            </>
          ) : shouldTrigger ? (
            <>
              <RefreshCw className="w-5 h-5 text-primary" />
              <span>Release to refresh</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-5 h-5 text-muted-foreground transition-transform"
                style={{ transform: `rotate(${progress * 180}deg)` }}
              />
              <span>Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`,
          transition: !pullDistance && !isRefreshing ? 'transform 0.2s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};
