import { SubscriptionService } from './subscription';
import type { SubscriptionFeatures } from '@/lib/subscription-tiers';

export class UsageTrackingService {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async checkAndTrackUsage(
    userId: string,
    feature: keyof SubscriptionFeatures,
    trackingFeature: string
  ): Promise<{ allowed: boolean; message?: string; shouldUpgrade?: boolean }> {
    // Check if user can use this feature
    const access = await this.subscriptionService.checkFeatureAccess(userId, feature);
    
    if (!access.allowed) {
      return {
        allowed: false,
        message: access.message,
        shouldUpgrade: true
      };
    }

    // Track the usage if allowed
    if (access.allowed) {
      await this.subscriptionService.trackUsage(userId, trackingFeature);
    }

    // If user is close to limit, warn them
    if (access.remaining !== undefined && access.limit !== undefined && access.limit !== -1) {
      const percentageUsed = ((access.limit - access.remaining) / access.limit) * 100;
      
      if (percentageUsed >= 90) {
        return {
          allowed: true,
          message: `You have ${access.remaining} uses remaining this month. Consider upgrading for more.`,
          shouldUpgrade: true
        };
      } else if (percentageUsed >= 75) {
        return {
          allowed: true,
          message: `You've used ${Math.round(percentageUsed)}% of your monthly limit.`
        };
      }
    }

    return { allowed: true };
  }

  async trackContractUpload(userId: string, contractId: string): Promise<{ allowed: boolean; message?: string }> {
    const result = await this.checkAndTrackUsage(
      userId,
      'contracts_per_month',
      'contract_upload'
    );

    if (result.allowed) {
      // Additional metadata for contract uploads
      await this.subscriptionService.trackUsage(userId, 'contract_upload', { contract_id: contractId });
    }

    return result;
  }

  async trackAIAnalysis(userId: string, contractId: string): Promise<{ allowed: boolean; message?: string }> {
    return this.checkAndTrackUsage(
      userId,
      'ai_analysis_per_month',
      'ai_analysis'
    );
  }

  async trackAIChatMessage(userId: string, contractId: string): Promise<{ allowed: boolean; message?: string }> {
    return this.checkAndTrackUsage(
      userId,
      'ai_chat_messages_per_month',
      'ai_chat'
    );
  }

  async trackFolderCreation(userId: string): Promise<{ allowed: boolean; message?: string }> {
    const profile = await this.subscriptionService.getUserProfile(userId);
    if (!profile) {
      return { allowed: false, message: 'User profile not found' };
    }

    const stats = await this.subscriptionService.getUsageStats(userId);
    const access = await this.subscriptionService.checkFeatureAccess(userId, 'folder_limit');

    if (!access.allowed) {
      return {
        allowed: false,
        message: `You've reached your folder limit of ${access.limit}. Upgrade to create more folders.`
      };
    }

    // Folders are permanent, not monthly, so we don't track them the same way
    return { allowed: true };
  }

  async checkExportAccess(userId: string, format: 'pdf' | 'word'): Promise<{ allowed: boolean; message?: string }> {
    const feature = format === 'pdf' ? 'export_pdf' : 'export_word';
    const access = await this.subscriptionService.checkFeatureAccess(userId, feature);

    if (!access.allowed) {
      return {
        allowed: false,
        message: `${format.toUpperCase()} export is not available in your current plan. Upgrade to export contracts.`
      };
    }

    // Track export usage
    await this.subscriptionService.trackUsage(userId, `export_${format}`);
    return { allowed: true };
  }

  async getUsageSummary(userId: string) {
    const profile = await this.subscriptionService.getUserProfile(userId);
    if (!profile) return null;

    const stats = await this.subscriptionService.getUsageStats(userId);
    const isInTrial = await this.subscriptionService.isUserInTrial(userId);
    const trialDaysRemaining = await this.subscriptionService.getRemainingTrialDays(userId);

    return {
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      isInTrial,
      trialDaysRemaining,
      usage: {
        contracts: stats.contracts_uploaded_this_month,
        aiAnalysis: stats.ai_analysis_this_month,
        aiChatMessages: stats.ai_chat_messages_this_month,
        folders: stats.folders_created
      },
      limits: {
        contracts: await this.subscriptionService.checkFeatureAccess(userId, 'contracts_per_month'),
        aiAnalysis: await this.subscriptionService.checkFeatureAccess(userId, 'ai_analysis_per_month'),
        aiChatMessages: await this.subscriptionService.checkFeatureAccess(userId, 'ai_chat_messages_per_month'),
        folders: await this.subscriptionService.checkFeatureAccess(userId, 'folder_limit')
      }
    };
  }
}