import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertCircle, RefreshCw, Send } from 'lucide-react';
import { readConfig } from '../core/config/store.js';

/**
 * Fallback UI component shown when an error is caught
 * Provides user-friendly error message and recovery options
 */
function ErrorFallback({ error, resetError }) {
  const [crashReportingEnabled, setCrashReportingEnabled] = React.useState(false);
  const [isReporting, setIsReporting] = React.useState(false);

  React.useEffect(() => {
    // Check if crash reporting is enabled
    readConfig().then(config => {
      setCrashReportingEnabled(config?.privacy?.crashReporting || false);
    }).catch(() => {
      setCrashReportingEnabled(false);
    });
  }, []);

  const handleReload = () => {
    // Clear error state and reload
    resetError();
    window.location.reload();
  };

  const handleReportError = async () => {
    if (!crashReportingEnabled) {
      console.warn('[ErrorBoundary] Cannot report error: crash reporting is disabled');
      return;
    }

    setIsReporting(true);
    try {
      // Capture the error manually with Sentry
      Sentry.captureException(error, {
        tags: {
          source: 'error-boundary-manual'
        }
      });

      // Show success feedback
      console.log('[ErrorBoundary] Error reported successfully');

      // Optionally show a toast or alert
      setTimeout(() => {
        setIsReporting(false);
      }, 2000);
    } catch (err) {
      console.error('[ErrorBoundary] Failed to report error:', err);
      setIsReporting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app-bg text-app-text p-8">
      <div className="max-w-2xl w-full">
        {/* Error icon and header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-app-danger/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-app-danger" />
          </div>
        </div>

        {/* Error message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-3 text-app-text">
            Something went wrong
          </h1>
          <p className="text-app-text-secondary mb-4">
            We encountered an unexpected error. Your work has been saved automatically.
            You can try reloading the application to continue.
          </p>

          {/* Technical details (collapsible) */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-app-text-secondary hover:text-app-text transition-colors">
              Technical details
            </summary>
            <div className="mt-3 p-4 bg-app-panel rounded-md border border-app-border">
              <pre className="text-xs text-app-text-secondary overflow-x-auto whitespace-pre-wrap break-words font-mono">
                {error?.message || 'Unknown error'}
                {error?.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </div>
          </details>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-app-accent hover:bg-app-accent-hover text-app-accent-fg rounded-md transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </button>

          {crashReportingEnabled && (
            <button
              onClick={handleReportError}
              disabled={isReporting}
              className="flex items-center gap-2 px-6 py-3 bg-app-panel hover:bg-app-panel-secondary text-app-text border border-app-border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isReporting ? 'Reporting...' : 'Report this error'}
            </button>
          )}
        </div>

        {/* Additional help text */}
        <div className="mt-8 text-center text-sm text-app-text-secondary">
          <p>
            If this problem persists, please check the{' '}
            <a
              href="https://github.com/lokus-ai/lokus/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-app-accent hover:underline"
            >
              GitHub issues
            </a>
            {' '}or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced ErrorBoundary using Sentry's error boundary
 * Automatically captures errors and sends them to Sentry if enabled
 */
const ErrorBoundary = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      showDialog={false}
      onError={(error, errorInfo) => {
        // Log error locally for debugging
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundary;
