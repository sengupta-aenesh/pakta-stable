import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_TIERS, canUseFeature, getTierByName } from '@/lib/subscription-tiers';
import type { SubscriptionFeatures } from '@/lib/subscription-tiers';
import type { UserProfile, UsageStats } from './subscription';

export class SubscriptionServiceServer {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async createUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await this.supabase;
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        subscription_tier: 'pro',
        subscription_status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  }

  async updateSubscription(
    userId: string,
    tier: string,
    status: string
  ): Promise<boolean> {
    const supabase = await this.supabase;
    const updates: any = {
      subscription_tier: tier,
      subscription_status: status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'active' && tier !== 'free') {
      updates.subscription_start_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }

    // Log subscription history
    await this.logSubscriptionChange(userId, tier, 'upgraded');

    return true;
  }

  async logSubscriptionChange(
    userId: string,
    tier: string,
    action: string,
    metadata?: any
  ): Promise<void> {
    const supabase = await this.supabase;
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        subscription_tier: tier,
        action,
        metadata
      });
  }

  async trackUsage(
    userId: string,
    feature: string,
    metadata?: any
  ): Promise<void> {
    const supabase = await this.supabase;
    await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        feature,
        metadata
      });
  }

  async getUsageStats(userId: string): Promise<UsageStats> {
    const supabase = await this.supabase;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get contract uploads
    const { data: uploads } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', 'contract_upload')
      .gte('created_at', monthStart.toISOString());

    // Get AI analysis usage
    const { data: analyses } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', 'ai_analysis')
      .gte('created_at', monthStart.toISOString());

    // Get AI chat usage
    const { data: chats } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('feature', 'ai_chat')
      .gte('created_at', monthStart.toISOString());

    // Get folder count
    const { count: folderCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      contracts_uploaded_this_month: uploads?.length || 0,
      ai_analysis_this_month: analyses?.length || 0,
      ai_chat_messages_this_month: chats?.length || 0,
      folders_created: folderCount || 0
    };
  }

  async checkFeatureAccess(
    userId: string,
    feature: keyof SubscriptionFeatures
  ): Promise<{ allowed: boolean; message?: string; limit?: number; remaining?: number }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return { allowed: false, message: 'User profile not found' };
    }

    // Everyone gets pro access now
    const effectiveTier = 'pro';

    // Get current usage for numeric features
    let currentUsage: number | undefined;
    if (feature === 'contracts_per_month') {
      const stats = await this.getUsageStats(userId);
      currentUsage = stats.contracts_uploaded_this_month;
    } else if (feature === 'ai_analysis_per_month') {
      const stats = await this.getUsageStats(userId);
      currentUsage = stats.ai_analysis_this_month;
    } else if (feature === 'ai_chat_messages_per_month') {
      const stats = await this.getUsageStats(userId);
      currentUsage = stats.ai_chat_messages_this_month;
    } else if (feature === 'folder_limit') {
      const stats = await this.getUsageStats(userId);
      currentUsage = stats.folders_created;
    }

    const access = canUseFeature(effectiveTier, feature, currentUsage);

    if (!access.allowed) {
      const tierConfig = getTierByName(effectiveTier);
      const featureLimit = tierConfig?.features[feature];
      
      if (typeof featureLimit === 'number' && featureLimit !== -1) {
        return {
          allowed: false,
          message: `You've reached your monthly limit of ${featureLimit} for ${feature.replace(/_/g, ' ')}. Upgrade to continue.`,
          limit: featureLimit,
          remaining: 0
        };
      } else if (typeof featureLimit === 'boolean') {
        return {
          allowed: false,
          message: `This feature is not available in your current plan. Upgrade to access ${feature.replace(/_/g, ' ')}.`
        };
      }
    }

    return access;
  }

  async isUserInTrial(userId: string): Promise<boolean> {
    // No trials anymore - everyone has full access
    return false;
  }

  async getRemainingTrialDays(userId: string): Promise<number> {
    // No trials anymore
    return 0;
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const supabase = await this.supabase;
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }

    await this.logSubscriptionChange(userId, 'free', 'cancelled');
    return true;
  }
}