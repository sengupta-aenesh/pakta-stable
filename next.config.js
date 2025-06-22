const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing Next.js config
  experimental: {
    esmExternals: true,
  },
  
  // For production deployment, ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript config
  typescript: {
    // Dangerously allow production builds to successfully complete even if project has type errors
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Additional optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    return config
  },
  
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  
  // Upload a larger set of source maps for better stack traces
  widenClientFileUpload: true,
  
  // Route browser requests through the reverse proxy to avoid ad-blockers
  // disabling the SDK
  tunnelRoute: "/monitoring-tunnel",
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
  
  // Skip source map upload if auth token is missing
  skipSourceMapsUpload: !process.env.SENTRY_AUTH_TOKEN,
}

// Conditionally wrap with Sentry only if DSN and auth token are provided
const shouldEnableSentry = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.SENTRY_AUTH_TOKEN

module.exports = shouldEnableSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;