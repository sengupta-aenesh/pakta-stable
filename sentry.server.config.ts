// This file configures the initialization of Sentry for server-side code
import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',
    
    environment: process.env.NODE_ENV,
    
    beforeSend: (event, hint) => {
      // Filter out specific server errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string;
          
          // Filter out common network/timeout errors
          if (message.includes('ECONNRESET') || 
              message.includes('ETIMEDOUT') ||
              message.includes('socket hang up')) {
            return null;
          }
          
          // Filter out Supabase connection errors (these are usually transient)
          if (message.includes('supabase') && 
             (message.includes('timeout') || message.includes('connection'))) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional context for server errors
    initialScope: {
      tags: {
        component: 'server'
      },
    },
  });
}