// This file configures the initialization of Sentry on the browser/client
import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',
    
    environment: process.env.NODE_ENV,
    
    // Basic integrations only to avoid compatibility issues
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    
    // Performance Monitoring
    beforeSend: (event, hint) => {
      // Filter out specific errors that are not actionable
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string;
          
          // Filter out network errors that users can't control
          if (message.includes('Network Error') || 
              message.includes('Failed to fetch') ||
              message.includes('Load failed')) {
            return null;
          }
          
          // Filter out browser extension errors
          if (message.includes('extension://') || 
              message.includes('chrome-extension://')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional context
    initialScope: {
      tags: {
        component: 'client'
      },
    },
  });
}