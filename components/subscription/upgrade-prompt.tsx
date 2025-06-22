'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { AlertCircle, Zap } from 'lucide-react';

interface UpgradePromptProps {
  message: string;
  feature?: string;
  currentTier?: string;
  recommendedTier?: string;
  onClose?: () => void;
  inline?: boolean;
}

export function UpgradePrompt({
  message,
  feature,
  currentTier = 'free',
  recommendedTier = 'starter',
  onClose,
  inline = false
}: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  if (inline) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-800">{message}</p>
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="mt-2"
            variant="secondary"
          >
            Upgrade Plan
          </Button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6 text-center max-w-md mx-auto">
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Zap className="w-6 h-6 text-yellow-600" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      
      <div className="flex gap-3 justify-center">
        <Button onClick={handleUpgrade} variant="primary">
          View Plans
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Maybe Later
          </Button>
        )}
      </div>
    </Card>
  );
}

interface UsageLimitWarningProps {
  used: number;
  limit: number;
  feature: string;
  onUpgrade?: () => void;
}

export function UsageLimitWarning({
  used,
  limit,
  feature,
  onUpgrade
}: UsageLimitWarningProps) {
  const router = useRouter();
  const percentage = (used / limit) * 100;
  const remaining = limit - used;
  
  if (percentage < 75) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/subscription');
    }
  };

  return (
    <div className={`rounded-lg p-3 text-sm ${
      percentage >= 90 
        ? 'bg-red-50 border border-red-200' 
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${
            percentage >= 90 ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <span className={percentage >= 90 ? 'text-red-800' : 'text-yellow-800'}>
            {remaining === 0 
              ? `You've reached your ${feature} limit`
              : `${remaining} ${feature} remaining this month`
            }
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUpgrade}
          className="text-xs"
        >
          Upgrade
        </Button>
      </div>
    </div>
  );
}