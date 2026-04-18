import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary that catches runtime errors and provides recovery options.
 * Prevents the entire app from crashing due to component-level errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate a short error ID for tracking
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    
    // Enhanced error logging with context
    console.error('[ErrorBoundary] Caught error:', {
      errorId,
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
    
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      // Clear all local storage
      localStorage.clear();
      // Clear session storage
      sessionStorage.clear();
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
    // Force reload
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                Something went wrong
              </h1>
              <p className="text-sm text-muted-foreground">
                The app encountered an unexpected error. This might be due to a temporary issue or cached data.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left text-xs bg-muted/50 rounded-lg p-3 overflow-auto max-h-32">
                <p className="font-mono text-destructive">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReload} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload App
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleClearAndReload}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache & Reload
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If the problem persists, try clearing your browser data or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
