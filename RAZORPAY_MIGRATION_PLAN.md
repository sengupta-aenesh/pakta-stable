# 🚀 Stripe to Razorpay Migration Plan

## 📋 Migration Overview

**Objective**: Replace Stripe with Razorpay while maintaining the exact same user experience and functionality.

**Razorpay Advantages for India:**
- ✅ **Immediate onboarding** for Indian businesses
- ✅ **Lower fees** (2.3% vs Stripe's 2.9%)
- ✅ **Local payment methods** (UPI, Netbanking, Wallets)
- ✅ **INR native** with no currency conversion
- ✅ **Better local support**

## 🔄 Feature Mapping: Stripe → Razorpay

| Stripe Feature | Razorpay Equivalent | Implementation |
|---|---|---|
| **Checkout Sessions** | Razorpay Checkout | Embedded/Hosted checkout |
| **Setup Sessions** | Customer + Token | Custom payment method collection |
| **Subscriptions** | Razorpay Subscriptions | Direct API mapping |
| **Customer Portal** | Custom UI | Build subscription management UI |
| **Webhooks** | Razorpay Webhooks | Different events, same logic |
| **Trials** | Custom Logic + Plans | 7-day trial with plan start delay |
| **Customer Management** | Customers API | Direct API mapping |

## 📁 Files to Migrate

### **1. Core Configuration Files**
```
lib/stripe-client.ts → lib/razorpay-client.ts
lib/stripe-server.ts → lib/razorpay-server.ts
```

### **2. API Endpoints**
```
app/api/stripe/webhook/route.ts → app/api/razorpay/webhook/route.ts
app/api/subscription/create-checkout-session/route.ts → Updated for Razorpay
app/api/subscription/create-setup-session/route.ts → Updated for Razorpay
app/api/subscription/complete-setup/route.ts → Updated for Razorpay
app/api/subscription/create-portal-session/route.ts → Custom portal implementation
```

### **3. Database Schema Changes**
```sql
-- Rename columns
ALTER TABLE profiles RENAME COLUMN stripe_customer_id TO razorpay_customer_id;
ALTER TABLE profiles RENAME COLUMN stripe_subscription_id TO razorpay_subscription_id;
ALTER TABLE subscription_history RENAME COLUMN stripe_event_id TO razorpay_event_id;
```

### **4. Environment Variables**
```env
# Remove Stripe vars
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PRICE_ID

# Add Razorpay vars
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_PLAN_ID=plan_...
```

### **5. Dependencies**
```json
// Remove
"@stripe/stripe-js": "^5.4.0",
"stripe": "^17.1.0"

// Add  
"razorpay": "^2.9.2"
```

## 🛠️ Implementation Strategy

### **Phase 1: Core Setup (Priority: High)**
1. ✅ Install Razorpay SDK
2. ✅ Create Razorpay client/server configuration
3. ✅ Update environment variables
4. ✅ Database schema migration

### **Phase 2: Payment Flow (Priority: High)**
1. ✅ Implement Razorpay checkout integration
2. ✅ Payment method collection during onboarding
3. ✅ Subscription creation with trial
4. ✅ Webhook event processing

### **Phase 3: User Experience (Priority: Medium)**
1. ✅ Update onboarding flow UI
2. ✅ Create custom subscription management UI
3. ✅ Trial status indicators
4. ✅ Payment success/failure handling

### **Phase 4: Testing & Polish (Priority: Low)**
1. ✅ End-to-end testing
2. ✅ Error handling improvements
3. ✅ Performance optimization
4. ✅ Documentation updates

## 🎯 Key Implementation Details

### **1. Trial Handling Strategy**
**Razorpay Approach**: Create subscription with start date 7 days in future
```javascript
const subscription = await razorpay.subscriptions.create({
  plan_id: 'plan_xxx',
  customer_id: 'cust_xxx',
  start_at: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000), // 7 days from now
  total_count: 12, // 12 months
  notes: {
    trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
})
```

### **2. Payment Method Collection**
**Razorpay Approach**: Create customer and collect payment method
```javascript
// Step 1: Create customer
const customer = await razorpay.customers.create({
  name: user.name,
  email: user.email,
  contact: user.phone
})

// Step 2: Create checkout for payment method setup (₹0 payment)
const order = await razorpay.orders.create({
  amount: 100, // ₹1 (minimum amount, will be refunded)
  currency: 'INR',
  receipt: `receipt_${Date.now()}`,
  payment_capture: true
})
```

### **3. Webhook Events Mapping**
| Stripe Event | Razorpay Event | Action |
|---|---|---|
| `customer.subscription.created` | `subscription.activated` | Activate subscription |
| `customer.subscription.updated` | `subscription.charged` | Update billing |
| `customer.subscription.deleted` | `subscription.cancelled` | Cancel subscription |
| `invoice.payment_succeeded` | `payment.captured` | Confirm payment |
| `invoice.payment_failed` | `payment.failed` | Handle failure |

### **4. Custom Subscription Management UI**
Since Razorpay doesn't have a built-in customer portal, we'll create:
- **Subscription details page**
- **Payment method management**
- **Billing history**
- **Plan upgrade/downgrade**
- **Cancellation flow**

## 🔒 Security Considerations

### **1. Webhook Signature Verification**
```javascript
// Razorpay webhook verification
const crypto = require('crypto')
const hmac = crypto.createHmac('sha256', webhookSecret)
hmac.update(JSON.stringify(req.body))
const expectedSignature = hmac.digest('hex')
const actualSignature = req.headers['x-razorpay-signature']
```

### **2. API Key Management**
- **Key ID**: Public (can be in frontend)
- **Key Secret**: Private (server-side only)
- **Webhook Secret**: Server-side only

## 📱 User Experience Flow

### **New Razorpay Flow**:
```
1. Sign Up → Email Verification → Onboarding
   ↓
2. Profile Setup → Payment Collection (Razorpay Checkout)
   ↓
3. Customer Created → Payment Method Stored → Trial Subscription Created
   ↓ 
4. 7-Day Trial (Full Access) → Dashboard with Trial Status
   ↓
5. After 7 Days → Subscription Auto-Starts → ₹100/month Billing
```

### **Payment Collection Method**:
1. **Embedded Razorpay Checkout** in onboarding
2. **₹1 payment** to verify payment method (auto-refunded)
3. **Customer and subscription created** with 7-day delay
4. **Seamless trial-to-paid** conversion

## 🎨 UI/UX Improvements

### **Indian User Experience Optimizations**:
1. **Currency display**: ₹100/month instead of $100
2. **Local payment methods**: UPI, Netbanking, Wallets
3. **GST handling**: 18% GST display and calculation
4. **Indian holidays**: Billing date adjustments
5. **Regional language support**: Hindi UI option

## 📊 Expected Benefits

### **Business Benefits**:
- ✅ **Immediate activation** (no waiting for Stripe approval)
- ✅ **Lower transaction fees** (save ~₹600/month per 100 customers)
- ✅ **Better conversion rates** with local payment methods
- ✅ **Faster settlements** (T+1 instead of T+7)

### **Technical Benefits**:
- ✅ **Better local support** and documentation
- ✅ **INR-native billing** (no forex issues)
- ✅ **Compliance** with Indian regulations
- ✅ **Performance** optimized for Indian users

---

## 🚀 Next Steps

1. **Create Razorpay account** and get API keys
2. **Implement core migration** (Phase 1 & 2)
3. **Test payment flows** with Razorpay test environment
4. **Deploy and monitor** the new integration
5. **Optimize based on** real user feedback

This migration will provide a **better, faster, and more cost-effective** payment solution for your Indian user base!