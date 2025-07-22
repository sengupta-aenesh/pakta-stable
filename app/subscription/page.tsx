'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { Check, X } from 'lucide-react';
// Stripe removed - payment functionality disabled
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks';

interface UserSubscription {
  tier: string;
  status: string;
  isInTrial: boolean;
  trialDaysRemaining: number;
  usage: {
    contracts: number;
    aiAnalysis: number;
    aiChatMessages: number;
    folders: number;
  };
  limits: {
    contracts: { limit?: number; remaining?: number };
    aiAnalysis: { limit?: number; remaining?: number };
    aiChatMessages: { limit?: number; remaining?: number };
    folders: { limit?: number; remaining?: number };
  };
}

export default function SubscriptionPage() {
  const notifications = useEnhancedNotifications();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/subscription/status');
      if (!response.ok) throw new Error('Failed to fetch subscription status');
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      notifications.error('Load Failed', 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tierName: string, priceId: string) => {
    setUpgrading(tierName);
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName, priceId }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      notifications.error('Checkout Failed', 'Failed to start checkout process');
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/create-portal-session', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to create portal session');

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      notifications.error('Portal Failed', 'Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const currentTier = subscription?.tier || 'free';
  const effectiveTier = subscription?.isInTrial ? 'professional' : currentTier;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your subscription and view usage</p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-8 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
            <p className="text-2xl font-bold capitalize">
              {SUBSCRIPTION_TIERS[effectiveTier]?.name || 'Free'}
              {subscription?.isInTrial && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (Trial - {subscription.trialDaysRemaining} days left)
                </span>
              )}
            </p>
            <p className="text-gray-600 mt-1">
              Status: <span className="capitalize">{subscription?.status || 'Active'}</span>
            </p>
          </div>
          {currentTier !== 'free' && (
            <Button variant="secondary" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          )}
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Contracts</p>
            <p className="text-xl font-semibold">
              {subscription?.usage.contracts || 0}
              {subscription?.limits.contracts.limit && subscription.limits.contracts.limit !== -1 && (
                <span className="text-sm text-gray-500">/{subscription.limits.contracts.limit}</span>
              )}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">AI Analysis</p>
            <p className="text-xl font-semibold">
              {subscription?.usage.aiAnalysis || 0}
              {subscription?.limits.aiAnalysis.limit && subscription.limits.aiAnalysis.limit !== -1 && (
                <span className="text-sm text-gray-500">/{subscription.limits.aiAnalysis.limit}</span>
              )}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">AI Chat Messages</p>
            <p className="text-xl font-semibold">
              {subscription?.usage.aiChatMessages || 0}
              {subscription?.limits.aiChatMessages.limit && subscription.limits.aiChatMessages.limit !== -1 && (
                <span className="text-sm text-gray-500">/{subscription.limits.aiChatMessages.limit}</span>
              )}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Folders</p>
            <p className="text-xl font-semibold">
              {subscription?.usage.folders || 0}
              {subscription?.limits.folders.limit && subscription.limits.folders.limit !== -1 && (
                <span className="text-sm text-gray-500">/{subscription.limits.folders.limit}</span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Pricing Plans */}
      <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          const isCurrentPlan = key === currentTier;
          const isPopular = tier.popular;
          
          return (
            <Card 
              key={key} 
              className={`relative p-6 ${isPopular ? 'border-2 border-blue-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <p className="text-3xl font-bold mb-1">
                ${tier.price}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </p>
              <p className="text-gray-600 text-sm mb-6">{tier.description}</p>

              {isCurrentPlan ? (
                <Button disabled className="w-full mb-6">
                  Current Plan
                </Button>
              ) : tier.price > 0 ? (
                <Button
                  onClick={() => handleUpgrade(key, tier.stripe_price_id!)}
                  disabled={!!upgrading}
                  className="w-full mb-6"
                  variant={isPopular ? 'primary' : 'secondary'}
                >
                  {upgrading === key ? 'Processing...' : 'Upgrade'}
                </Button>
              ) : (
                <Button disabled className="w-full mb-6" variant="secondary">
                  Free Plan
                </Button>
              )}

              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {tier.features.contracts_per_month === -1 
                        ? 'Unlimited contracts' 
                        : `${tier.features.contracts_per_month} contracts/month`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {tier.features.ai_analysis_per_month === -1 
                        ? 'Unlimited AI analysis' 
                        : `${tier.features.ai_analysis_per_month} AI analyses/month`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {tier.features.export_pdf ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={tier.features.export_pdf ? '' : 'text-gray-400'}>
                      PDF & Word export
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {tier.features.advanced_ai_features ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={tier.features.advanced_ai_features ? '' : 'text-gray-400'}>
                      Advanced AI features
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {tier.features.team_collaboration ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={tier.features.team_collaboration ? '' : 'text-gray-400'}>
                      Team collaboration
                    </span>
                  </div>
                  {tier.features.api_access && (
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>API access</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}