import { useState, useRef, useCallback, useEffect } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  isComplete: boolean;
}

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 60,
  maxPull = 120,
}: UsePullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    isComplete: false,
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only trigger at the top of the scrollable area
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setState(prev => ({ ...prev, isPulling: true }));
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isPulling || state.isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      // Apply resistance as pull distance increases
      const resistance = 1 - Math.min(deltaY / maxPull, 0.5);
      const pullDistance = Math.min(deltaY * resistance, maxPull);
      setState(prev => ({ ...prev, pullDistance }));
      
      // Prevent default scroll behavior when pulling
      if (pullDistance > 10) {
        e.preventDefault();
      }
    }
  }, [state.isPulling, state.isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (state.pullDistance >= threshold && !state.isRefreshing) {
      setState(prev => ({ ...prev, isRefreshing: true, pullDistance: threshold }));
      
      try {
        await onRefresh();
        setState(prev => ({ ...prev, isComplete: true }));
        
        // Reset after showing completion
        setTimeout(() => {
          setState({
            isPulling: false,
            pullDistance: 0,
            isRefreshing: false,
            isComplete: false,
          });
        }, 500);
      } catch (error) {
        console.error('Refresh failed:', error);
        setState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          isComplete: false,
        });
      }
    } else {
      // Reset if threshold not met
      setState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        isComplete: false,
      });
    }
  }, [state.pullDistance, state.isRefreshing, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    isComplete: state.isComplete,
    isPulling: state.isPulling,
    threshold,
  };
};
