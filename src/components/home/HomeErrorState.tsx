import React, { forwardRef } from 'react';
import { AlertTriangle, RefreshCw, Clock, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeErrorStateProps {
  failedQueries: { name: string; error: Error | null }[];
  onRetry: () => void;
  showDebug?: boolean;
}

export const HomeErrorState = forwardRef<HTMLDivElement, HomeErrorStateProps>(
  ({ failedQueries, onRetry, showDebug = false }, ref) => {
    const isDev = import.meta.env.DEV;
    const isTimeout = failedQueries.some(q => q.error?.message?.includes('timed out'));
    const isOffline = !navigator.onLine;

    const getTitle = () => {
      if (isOffline) return "You're offline";
      if (isTimeout) return "Taking longer than expected";
      return "Couldn't load content";
    };

    const getMessage = () => {
      if (isOffline) return "Check your internet connection and try again.";
      if (isTimeout) return "This is taking longer than usual. Please check your connection and try again.";
      return "We had trouble loading some sections. Please try again.";
    };

    const Icon = isOffline ? WifiOff : isTimeout ? Clock : AlertTriangle;

    return (
      <div ref={ref} className="glass-premium rounded-2xl p-6 border border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-destructive/10">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {getTitle()}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {getMessage()}
              </p>
            </div>

            {/* Debug info - only in dev or with ?homeDebug=1 */}
            {(isDev || showDebug) && failedQueries.length > 0 && (
              <div className="text-xs font-mono bg-muted/50 rounded p-3 space-y-1">
                <p className="font-semibold text-muted-foreground">Debug info:</p>
                <p className="text-muted-foreground">Online: {navigator.onLine ? 'Yes' : 'No'}</p>
                {failedQueries.map((q) => (
                  <p key={q.name} className="text-destructive">
                    {q.name}: {q.error?.message || 'Unknown error'}
                  </p>
                ))}
              </div>
            )}

            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

HomeErrorState.displayName = 'HomeErrorState';
