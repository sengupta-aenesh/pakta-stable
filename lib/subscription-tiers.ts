export interface SubscriptionFeatures {
  contracts_per_month: number;
  ai_analysis_per_month: number;
  ai_chat_messages_per_month: number;
  basic_templates: boolean;
  advanced_templates: boolean;
  export_pdf: boolean;
  export_word: boolean;
  advanced_ai_features: boolean;
  priority_support: boolean;
  custom_branding: boolean;
  api_access: boolean;
  team_collaboration: boolean;
  folder_limit: number;
  storage_limit_mb: number;
  contract_history_days: number;
  bulk_operations: boolean;
}

export interface SubscriptionTier {
  name: string;
  features: SubscriptionFeatures;
  description: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  pro: {
    name: 'Contract Manager Pro',
    description: 'AI-powered contract analysis and management platform',
    popular: true,
    features: {
      contracts_per_month: -1, // unlimited
      ai_analysis_per_month: -1, // unlimited
      ai_chat_messages_per_month: -1, // unlimited
      basic_templates: true,
      advanced_templates: true,
      export_pdf: true,
      export_word: true,
      advanced_ai_features: true,
      priority_support: true,
      custom_branding: true,
      api_access: true,
      team_collaboration: true,
      folder_limit: -1, // unlimited
      storage_limit_mb: -1, // unlimited
      contract_history_days: -1, // unlimited
      bulk_operations: true,
    }
  }
};

// No trials anymore - everyone gets full access

export function getTierByName(tierName: string): SubscriptionTier | null {
  return SUBSCRIPTION_TIERS[tierName] || null;
}

export function canUseFeature(
  tier: string,
  feature: keyof SubscriptionFeatures,
  currentUsage?: number
): { allowed: boolean; limit?: number; remaining?: number } {
  const tierConfig = getTierByName(tier);
  if (!tierConfig) {
    return { allowed: false };
  }

  const featureValue = tierConfig.features[feature];
  
  // Boolean features
  if (typeof featureValue === 'boolean') {
    return { allowed: featureValue };
  }
  
  // Numeric features (with limits)
  if (typeof featureValue === 'number') {
    if (featureValue === -1) {
      // Unlimited
      return { allowed: true, limit: -1 };
    }
    
    if (currentUsage !== undefined) {
      const remaining = featureValue - currentUsage;
      return {
        allowed: remaining > 0,
        limit: featureValue,
        remaining: Math.max(0, remaining)
      };
    }
    
    return { allowed: true, limit: featureValue };
  }
  
  return { allowed: false };
}