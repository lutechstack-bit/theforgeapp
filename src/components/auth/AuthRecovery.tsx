import React from 'react';
import { AlertCircle, RefreshCw, Trash2, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import forgeLogo from '@/assets/forge-logo.png';

interface AuthRecoveryProps {
  /** Whether auth is still attempting to initialize */
  isRetrying?: boolean;
  /** Callback to retry auth initialization */
  onRetry: () => void;
  /** Callback to clear session and reload */
  onClearSession: () => void;
}

/**
 * Recovery UI shown when auth initialization times out.
 * Provides users with actionable options to recover from stuck states.
 */
export const AuthRecovery: React.FC<AuthRecoveryProps> = ({
  isRetrying = false,
  onRetry,
  onClearSession,
}) => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <img 
          src={forgeLogo} 
          alt="the Forge" 
          className="h-12 mx-auto opacity-80"
        />
        
        {/* Warning Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
          {isOnline ? (
            <AlertCircle className="h-7 w-7 text-amber-500" />
          ) : (
            <WifiOff className="h-7 w-7 text-amber-500" />
          )}
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground">
            {isOnline ? 'Session initialization timed out' : 'You appear to be offline'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isOnline 
              ? "We're having trouble connecting. This could be due to a slow network, cached data, or a temporary service issue."
              : 'Please check your internet connection and try again.'
            }
          </p>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Network connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-amber-500" />
              <span>No network connection</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={onRetry} 
            className="w-full"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClearSession}
            className="w-full"
            disabled={isRetrying}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache & Reload
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            &quot;Clear Cache & Reload&quot; will sign you out and clear all cached data, 
            which often fixes issues caused by stale app versions.
          </p>
          <p className="text-xs text-muted-foreground">
            If you continue to have issues, try using a different browser or device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthRecovery;
