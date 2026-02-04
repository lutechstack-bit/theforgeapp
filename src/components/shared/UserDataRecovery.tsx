import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, Trash2 } from 'lucide-react';
import forgeLogo from '@/assets/forge-logo.png';

interface UserDataRecoveryProps {
  isRetrying: boolean;
  onRetry: () => void;
  onClearCache: () => void;
  onSignOut: () => void;
  message?: string;
}

/**
 * Recovery UI shown when user data (profile/edition) fails to load
 * but we still have a valid session. Gives users clear actions to recover.
 */
export const UserDataRecovery: React.FC<UserDataRecoveryProps> = ({
  isRetrying,
  onRetry,
  onClearCache,
  onSignOut,
  message = "We're having trouble loading your profile data."
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <img src={forgeLogo} alt="the Forge" className="h-10 opacity-80" />
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Connection Issue</h2>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
            onClick={onClearCache}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache & Reload
          </Button>
          
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full text-muted-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          If this keeps happening, check your internet connection or try again later.
        </p>
      </div>
    </div>
  );
};
