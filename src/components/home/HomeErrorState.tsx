import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

interface HomeErrorStateProps {
  failedQueries: { name: string; error: Error | null }[];
  onRetry: () => void;
  showDebug?: boolean;
}

export const HomeErrorState: React.FC<HomeErrorStateProps> = ({
  failedQueries,
  onRetry,
  showDebug = false,
}) => {
  const isDev = import.meta.env.DEV;

  return (
    <div className="glass-premium rounded-2xl p-6 border border-destructive/30 bg-destructive/5">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Couldn't load content
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              We had trouble loading some sections. Please try again.
            </p>
          </div>

          {/* Debug info - only in dev or with ?homeDebug=1 */}
          {(isDev || showDebug) && failedQueries.length > 0 && (
            <div className="text-xs font-mono bg-muted/50 rounded p-3 space-y-1">
              <p className="font-semibold text-muted-foreground">Debug info:</p>
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
};
