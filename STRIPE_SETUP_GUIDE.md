# Stripe Subscription Setup Guide (Non-Technical)

This guide will walk you through setting up Stripe for your contract management platform subscription system.

## What You'll Need
- A Stripe account (free to create)
- About 30 minutes to complete the setup

## Step 1: Create Your Stripe Account

1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Fill in your business information:
   - Email address
   - Full name
   - Country
   - Password
4. Verify your email address by clicking the link Stripe sends you

## Step 2: Complete Your Stripe Account Setup

1. Log into your Stripe Dashboard at https://dashboard.stripe.com
2. You'll see a checklist - complete these items:
   - Add your business details
   - Add your bank account (where you'll receive payments)
   - Verify your identity (Stripe will ask for ID)

## Step 3: Create Your Subscription Product

1. In the Stripe Dashboard, click "Products" in the left menu
2. Click "Add product"
3. Fill in these details:
   - **Product name**: Contract Manager Pro
   - **Description**: AI-powered contract management platform
   - **Image**: Upload your logo (optional)
4. Click "Add product"

## Step 4: Create Your Pricing

1. After creating the product, you'll see "Add a price"
2. Fill in:
   - **Price**: 100.00
   - **Currency**: USD
   - **Billing period**: Monthly
3. Click "Add price"
4. **IMPORTANT**: Copy the price ID that appears (it looks like: price_1ABC123...)

## Step 5: Set Up Your 7-Day Free Trial

1. Still on the pricing page, click "Edit" next to your price
2. Scroll down to "Free trial"
3. Toggle on "Add a free trial"
4. Enter: 7 days
5. Save changes

## Step 6: Get Your API Keys

1. In the Stripe Dashboard, click "Developers" in the left menu
2. Click "API keys"
3. You'll see two important keys:
   - **Publishable key** (starts with: pk_test_...)
   - **Secret key** (starts with: sk_test_...)
4. Copy both keys and save them somewhere safe

## Step 7: Set Up Webhooks

1. Still in "Developers", click "Webhooks"
2. Click "Add endpoint"
3. Fill in:
   - **Endpoint URL**: https://your-website.com/api/stripe/webhook
   - Select events: Choose "Select all" for now
4. Click "Add endpoint"
5. Copy the "Signing secret" (starts with: whsec_...)

## Step 8: Add Keys to Your Application

Create or update your `.env.local` file with these values:

```
# Stripe Keys (from Step 6)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Webhook Secret (from Step 7)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Price ID (from Step 4)
NEXT_PUBLIC_STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

## Step 9: Test Your Setup

1. Stripe provides test card numbers for testing:
   - Card number: 4242 4242 4242 4242
   - Expiry: Any future date (like 12/34)
   - CVC: Any 3 digits (like 123)
   - ZIP: Any 5 digits (like 12345)

## Step 10: Go Live

When you're ready to accept real payments:

1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Get your live API keys (they start with pk_live_ and sk_live_)
3. Update your `.env.local` file with the live keys
4. Create your product and price again in live mode
5. Update the webhook with your live website URL

## Important Notes

- **Keep your secret key secret!** Never share it or commit it to GitHub
- Test everything in test mode first
- Stripe takes a fee of 2.9% + 30¢ per successful charge
- You'll receive payouts to your bank account on a regular schedule (usually 2-7 days)

## Need Help?

- Stripe Support: https://support.stripe.com
- Stripe Documentation: https://stripe.com/docs

## Next Steps for Your Developer

Show this guide to your developer along with the API keys. They'll need to update the code to use just one plan ($100/month with 7-day trial) instead of multiple tiers.