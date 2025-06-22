'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancelledPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your subscription process was cancelled. No charges were made to your account.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/subscription')}
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Plans Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Card>
    </div>
  );
}