# Vercel Production Deployment Guide

## 🚀 **Production Deployment Checklist**

### **1. Environment Variables (Required)**

Add these to your Vercel project settings:

```bash
# Supabase (Production Database)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# UploadThing (File Upload Service)
UPLOADTHING_TOKEN=your_uploadthing_token

# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### **2. Vercel Project Configuration**

Your `vercel.json` is already configured:
- ✅ Build command: `next build`
- ✅ Framework: Next.js
- ✅ Region: US East (iad1)
- ✅ Production URL: `https://beta.pakta.app`

### **3. Database Setup (Supabase Production)**

1. **Create Production Database**:
   - New Supabase project for production
   - Update environment variables with production credentials
   
2. **Run Database Migrations**:
   ```sql
   -- Copy and run these SQL files in Supabase SQL Editor:
   -- 1. contract_knowledge_base_migration.sql
   -- 2. contract_templates_data.sql
   ```

### **4. Domain Configuration**

Current configuration points to: `https://beta.pakta.app`

**To update domain:**
1. Update `vercel.json` with your domain
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
3. Configure custom domain in Vercel dashboard

### **5. Build Optimizations**

✅ **Already Configured:**
- Next.js 14 with App Router
- Turbopack for fast development
- Sentry source map uploading
- Webpack optimizations
- ESM externals support

### **6. Security Configuration**

✅ **Production Security:**
- HTTPS enforced
- Environment variables server-side only
- Sentry error filtering
- API route protection
- Auth middleware active

### **7. Performance Optimizations**

✅ **Already Optimized:**
- Image optimization enabled
- Bundle analysis configured
- Sentry performance monitoring (10% sampling)
- Edge runtime for auth middleware
- Static generation where possible

## 🛠 **Deployment Steps**

### **Option 1: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### **Option 2: GitHub Integration**

1. **Connect Repository**:
   - Link GitHub repo to Vercel
   - Auto-deploy on push to main branch

2. **Configure Build Settings**:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### **Option 3: Manual Deployment**

```bash
# Build locally
npm run build

# Deploy build artifacts
vercel deploy --prebuilt --prod
```

## 📋 **Pre-Deployment Testing**

### **Local Production Build**
```bash
# Test production build locally
npm run build
npm start

# Verify all features work:
# - Authentication flow
# - Contract creation
# - File uploads
# - AI analysis
# - Error handling
```

### **Environment Variable Validation**
```bash
# Check all required variables are set
node -e "
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'OPENAI_API_KEY',
  'UPLOADTHING_TOKEN',
  'NEXT_PUBLIC_SENTRY_DSN'
];
required.forEach(key => {
  if (!process.env[key]) console.log('❌ Missing:', key);
  else console.log('✅ Found:', key);
});
"
```

## 🔧 **Post-Deployment Verification**

### **1. Functionality Testing**
- [ ] User registration/login works
- [ ] Contract creation flow works
- [ ] File upload functionality
- [ ] AI contract analysis
- [ ] Onboarding flow
- [ ] Dashboard navigation

### **2. Performance Testing**
- [ ] Page load times < 3 seconds
- [ ] API response times acceptable
- [ ] Image optimization working
- [ ] Bundle size optimized

### **3. Error Monitoring**
- [ ] Sentry receiving errors
- [ ] Error boundaries working
- [ ] Production error filtering active
- [ ] User context capture working

## 🚨 **Production Considerations**

### **Subscription System**
Currently **bypassed** for production deployment. To fully remove:
1. Remove subscription checks from middleware
2. Remove Stripe integration
3. Remove subscription UI components

### **Rate Limiting**
Consider adding rate limiting for:
- AI API calls
- File uploads
- Authentication attempts

### **Monitoring & Alerts**
- ✅ Sentry error monitoring
- Consider adding uptime monitoring
- Set up Vercel analytics
- Configure Sentry alerts

## 📈 **Scaling Considerations**

### **Database (Supabase)**
- Monitor connection pooling
- Set up read replicas if needed
- Configure row-level security

### **AI Processing**
- Monitor OpenAI API usage
- Implement request queuing for high load
- Consider caching frequent analyses

### **File Storage**
- UploadThing handles scaling automatically
- Monitor storage usage and costs

## 🎯 **Ready for Deployment!**

Your contract management platform is production-ready with:
- ✅ Complete error monitoring
- ✅ Production-optimized builds
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ Comprehensive documentation

**Deploy with confidence!** 🚀