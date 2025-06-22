import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UsageTrackingService } from '@/lib/services/usage-tracking';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return a default status temporarily to bypass subscription checks
    const defaultStatus = {
      tier: 'pro',
      status: 'active',
      usage: {
        contracts_uploaded_this_month: 0,
        ai_analysis_this_month: 0
      },
      limits: {
        monthly_contracts: -1, // unlimited
        ai_analysis: -1 // unlimited
      },
      trial: {
        active: false,
        days_remaining: 0
      }
    };

    return NextResponse.json(defaultStatus);
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}