'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
// Removed toast import - notifications handled by components

interface SubscriptionStatus {
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
    contracts: { allowed: boolean; limit?: number; remaining?: number };
    aiAnalysis: { allowed: boolean; limit?: number; remaining?: number };
    aiChatMessages: { allowed: boolean; limit?: number; remaining?: number };
    folders: { allowed: boolean; limit?: number; remaining?: number };
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/subscription/status');
      if (!response.ok) throw new Error('Failed to fetch subscription');
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Set up real-time subscription updates
    const channel = supabase
      .channel('subscription_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchSubscription();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkLimit = (feature: 'contracts' | 'aiAnalysis' | 'aiChatMessages' | 'folders') => {
    if (!subscription) return { allowed: true };
    
    const limit = subscription.limits[feature];
    if (!limit.allowed) {
      // Notification will be shown by the calling component
      console.warn(getUpgradeMessage(feature, limit.limit || 0));
    }
    
    return limit;
  };

  const getUpgradeMessage = (feature: string, limit: number) => {
    const messages: Record<string, string> = {
      contracts: `You've reached your limit of ${limit} contracts this month. Upgrade to continue.`,
      aiAnalysis: `You've reached your limit of ${limit} AI analyses this month. Upgrade to continue.`,
      aiChatMessages: `You've reached your limit of ${limit} AI chat messages this month. Upgrade to continue.`,
      folders: `You've reached your limit of ${limit} folders. Upgrade to create more.`
    };
    
    return messages[feature] || 'You\'ve reached your plan limit. Upgrade to continue.';
  };

  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    const featureMap: Record<string, boolean> = {
      'export_pdf': subscription.tier !== 'free',
      'export_word': subscription.tier !== 'free',
      'advanced_ai': subscription.tier === 'professional' || subscription.tier === 'enterprise',
      'team_collaboration': subscription.tier === 'professional' || subscription.tier === 'enterprise',
      'api_access': subscription.tier === 'enterprise',
      'custom_branding': subscription.tier === 'enterprise'
    };
    
    return featureMap[feature] || false;
  };

  return {
    subscription,
    loading,
    checkLimit,
    canUseFeature,
    refetch: fetchSubscription
  };
}