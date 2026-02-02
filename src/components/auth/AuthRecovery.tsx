import React from 'react';
import { AlertCircle, RefreshCw, Trash2, Loader2 } from 'lucide-react';
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
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground">
            Session initialization timed out
          </h1>
          <p className="text-sm text-muted-foreground">
            We're having trouble connecting. This could be due to a slow network or cached session data.
          </p>
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
            Clear Session & Reload
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If you continue to have issues, try using a different browser or device.
        </p>
      </div>
    </div>
  );
};

export default AuthRecovery;
