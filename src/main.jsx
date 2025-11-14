import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import { ThemeProvider } from "./hooks/theme.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { beforeSendHook } from "./utils/privacy.js";
import "./styles/globals.css";
import "./styles/kanban.css";
import "./styles/windows.css";

// Load KaTeX for math rendering
import katex from "katex";
import "katex/dist/katex.min.css";

// Make KaTeX globally available for the math extension
if (typeof globalThis !== 'undefined') {
  globalThis.katex = katex;
} else if (typeof window !== 'undefined') {
  window.katex = katex;
}

// Make React globally available for plugins
if (typeof globalThis !== 'undefined') {
  globalThis.React = React;
} else if (typeof window !== 'undefined') {
  window.React = React;
}

// Initialize Sentry crash reporting
if (import.meta.env.VITE_SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
      // Get release version from package.json
      release: 'lokus@1.3.3',

      // Browser tracing integration with reduced sample rate
      integrations: [
        Sentry.browserTracingIntegration({
          tracePropagationTargets: ['localhost', /^https:\/\/lokusmd\.com/],
          // Only trace 10% of transactions for performance
          traceSampleRate: 0.1,
        }),
        Sentry.replayIntegration({
          // Don't record normal sessions
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Performance monitoring - sample 10% of transactions
      tracesSampleRate: 0.1,

      // Session replay - don't record normal sessions
      replaysSessionSampleRate: 0.0,
      // Capture 50% of sessions with errors
      replaysOnErrorSampleRate: 0.5,

      // Privacy-first: scrub PII before sending
      beforeSend: beforeSendHook,

      // Don't send in development
      enabled: import.meta.env.MODE === 'production',
    });

    console.log('[Sentry] Crash reporting initialized');
    console.log('[Sentry] Environment:', import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development');
    console.log('[Sentry] Mode:', import.meta.env.MODE);
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
} else {
  console.log('[Sentry] DSN not configured - crash reporting disabled');
}

console.log('🚀 Main.jsx starting to render');
console.log('🚀 Window location:', window.location.href);
console.log('🚀 DOM root element:', document.getElementById("root"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);