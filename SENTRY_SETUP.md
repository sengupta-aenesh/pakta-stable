# Sentry Error Monitoring Setup

This document outlines the complete Sentry integration for comprehensive error monitoring and performance tracking.

## 🚀 **Setup Complete**

### **Installed Packages**
- `@sentry/nextjs` - Next.js specific Sentry integration
- `@sentry/react` - React error boundaries and performance monitoring

### **Configuration Files**
- `sentry.client.config.ts` - Browser/client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking  
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Next.js instrumentation hook
- `next.config.js` - Sentry webpack plugin configuration

### **Core Components**
- `components/error-boundary.tsx` - React error boundary with Sentry integration
- `lib/sentry-utils.ts` - Helper functions for error tracking
- `lib/api-error-handler.ts` - API route error handling utilities

## 🔧 **Environment Variables Required**

Add these to your `.env.local` file:

```bash
# Sentry Configuration (Required)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional: For source map uploads
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project  
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## 📋 **Getting Your Sentry DSN**

1. **Create Sentry Account**: Visit [sentry.io](https://sentry.io) and sign up
2. **Create New Project**: 
   - Select "Next.js" as platform
   - Choose your organization
   - Name your project "contract-manager" 
3. **Copy DSN**: From your project settings → Client Keys → DSN
4. **Add to Environment**: Paste DSN into `NEXT_PUBLIC_SENTRY_DSN`

## 🎯 **Features Enabled**

### **Error Tracking**
- ✅ **Client-side JavaScript errors**
- ✅ **Server-side API errors** 
- ✅ **React component errors** (via Error Boundary)
- ✅ **Authentication errors**
- ✅ **Contract processing errors**
- ✅ **AI/OpenAI integration errors**
- ✅ **File upload errors**

### **Performance Monitoring**
- ✅ **Page load times**
- ✅ **API response times**
- ✅ **User interactions** (clicks, form submissions)
- ✅ **Navigation tracking**
- ✅ **Database query performance**

### **User Context**
- ✅ **User ID and email** automatically attached to errors
- ✅ **User actions** tracked via breadcrumbs
- ✅ **Session replay** for error reproduction
- ✅ **Custom tags** for feature-specific tracking

### **Smart Filtering**
- ✅ **Network errors** filtered out (not user actionable)
- ✅ **Browser extension errors** filtered out
- ✅ **Development vs Production** different sampling rates
- ✅ **Transient connection errors** filtered out

## 🛠 **Usage Examples**

### **Manual Error Capture**
```typescript
import { captureErrorWithContext } from '@/lib/sentry-utils'

try {
  // Your code here
} catch (error) {
  captureErrorWithContext(error as Error, {
    feature: 'contract_upload',
    operation: 'file_processing',
    userId: user.id,
    additionalData: { fileType: 'pdf', fileSize: 1024 }
  })
}
```

### **Contract-Specific Errors**
```typescript
import { captureContractError } from '@/lib/sentry-utils'

captureContractError(error, contractId, 'analysis', {
  analysisType: 'risk_assessment',
  userId: user.id
})
```

### **API Route Error Handling**
```typescript
import { apiErrorHandler } from '@/lib/api-error-handler'

export const POST = apiErrorHandler(async (request: NextRequest) => {
  // Your API logic here
  // Errors automatically captured and handled
})
```

### **User Action Tracking**
```typescript
import { captureUserAction } from '@/lib/sentry-utils'

captureUserAction('contract_created', {
  contractType: 'employment',
  aiGenerated: true
})
```

## 📊 **Monitoring Dashboard**

Once configured, you'll have access to:

1. **Error Dashboard**: Real-time error tracking with stack traces
2. **Performance Insights**: Page load times, API performance
3. **User Impact**: Which users are affected by errors
4. **Release Tracking**: Error rates across deployments
5. **Session Replay**: See exactly what users experienced during errors

## 🚨 **Error Boundary Integration**

The Error Boundary is automatically active in your root layout:

```tsx
// app/layout.tsx
<ErrorBoundary>
  <ToastProvider>
    <main>{children}</main>
  </ToastProvider>
</ErrorBoundary>
```

### **Custom Error Pages**
Users will see a friendly error page instead of crashes:
- Shows error ID for support
- "Try Again" button to recover
- "Go Home" button as fallback
- Development details (in dev mode only)

## 🔄 **Production vs Development**

### **Development Mode**
- ✅ Debug logging enabled
- ✅ 100% error sampling
- ✅ 100% performance sampling  
- ✅ Full error details shown to users

### **Production Mode**
- ✅ 10% performance sampling (cost optimization)
- ✅ 100% error sampling (catch all errors)
- ✅ Silent logging
- ✅ Generic error messages for users
- ✅ Source map uploads (with auth token)

## 🎯 **Next Steps**

1. **Add Sentry DSN** to your environment variables
2. **Deploy to production** to start collecting real errors
3. **Set up alerts** in Sentry dashboard for critical errors
4. **Configure integrations** (Slack, email notifications)
5. **Review error trends** weekly to improve platform stability

## 📈 **Benefits**

- **Proactive error detection** before users report issues
- **Rich context** for faster debugging
- **User impact assessment** for error prioritization  
- **Performance optimization** insights
- **Better user experience** with graceful error handling
- **Production stability** monitoring

Your contract management platform now has enterprise-grade error monitoring! 🎉