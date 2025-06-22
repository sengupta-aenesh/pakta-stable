-- Create profiles table for subscription management
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'incomplete', 'trialing')),
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    monthly_contract_count INTEGER DEFAULT 0,
    last_contract_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription history table
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'upgraded', 'downgraded', 'cancelled', 'renewed', 'trial_started', 'trial_ended')),
    stripe_event_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('contract_upload', 'contract_creation', 'ai_analysis', 'ai_chat', 'export_pdf', 'export_word', 'folder_creation')),
    count INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX idx_subscription_history_created_at ON public.subscription_history(created_at DESC);
CREATE INDEX idx_usage_tracking_user_id_feature ON public.usage_tracking(user_id, feature);
CREATE INDEX idx_usage_tracking_created_at ON public.usage_tracking(created_at DESC);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for subscription_history
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription history" ON public.subscription_history
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to reset monthly usage counts
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET monthly_contract_count = 0,
        last_contract_reset = NOW(),
        updated_at = NOW()
    WHERE last_contract_reset < date_trunc('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
    p_user_id UUID,
    p_feature TEXT,
    p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_usage_count INTEGER;
    v_current_month_start DATE;
BEGIN
    v_current_month_start := date_trunc('month', NOW());
    
    SELECT COUNT(*)
    INTO v_usage_count
    FROM public.usage_tracking
    WHERE user_id = p_user_id
    AND feature = p_feature
    AND created_at >= v_current_month_start;
    
    RETURN v_usage_count < p_limit OR p_limit = -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add subscription columns to existing contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS is_premium_feature BOOLEAN DEFAULT FALSE;

-- Create a view for user subscription status with usage
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT 
    p.id AS user_id,
    p.subscription_tier,
    p.subscription_status,
    p.trial_end_date,
    p.subscription_end_date,
    p.monthly_contract_count,
    CASE 
        WHEN p.subscription_status = 'trialing' AND p.trial_end_date > NOW() THEN true
        ELSE false
    END AS in_trial,
    CASE 
        WHEN p.subscription_status = 'active' OR 
             (p.subscription_status = 'trialing' AND p.trial_end_date > NOW()) THEN true
        ELSE false
    END AS has_active_subscription,
    (
        SELECT COUNT(*)
        FROM public.usage_tracking ut
        WHERE ut.user_id = p.id
        AND ut.feature = 'contract_upload'
        AND ut.created_at >= date_trunc('month', NOW())
    ) AS contracts_uploaded_this_month,
    (
        SELECT COUNT(*)
        FROM public.usage_tracking ut
        WHERE ut.user_id = p.id
        AND ut.feature = 'ai_analysis'
        AND ut.created_at >= date_trunc('month', NOW())
    ) AS ai_analysis_this_month
FROM public.profiles p;

-- Grant permissions on the view
GRANT SELECT ON public.user_subscription_status TO authenticated;