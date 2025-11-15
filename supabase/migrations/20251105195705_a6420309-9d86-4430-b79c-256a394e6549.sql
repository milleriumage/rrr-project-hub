-- Create admin settings table to persist configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sidebar_visibility jsonb NOT NULL DEFAULT '{
    "store": true,
    "outfitGenerator": true,
    "themeGenerator": true,
    "manageSubscription": true,
    "earnCredits": true,
    "createContent": false,
    "myCreations": false,
    "creatorPayouts": false
  }'::jsonb,
  navbar_visibility jsonb NOT NULL DEFAULT '{
    "addCreditsButton": true,
    "planButton": true
  }'::jsonb,
  dev_settings jsonb NOT NULL DEFAULT '{
    "platformCommission": 0.50,
    "creditValueUSD": 0.01,
    "withdrawalCooldownHours": 24,
    "maxImagesPerCard": 5,
    "maxVideosPerCard": 2,
    "commentsEnabled": false
  }'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read settings
CREATE POLICY "Anyone can read admin settings"
  ON public.admin_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings (for now, any authenticated user can update)
CREATE POLICY "Authenticated users can update admin settings"
  ON public.admin_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert default settings if not exists
INSERT INTO public.admin_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create table for external payments tracking
CREATE TABLE IF NOT EXISTS public.external_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'mercado_pago', 'stripe', etc
  provider_payment_id text NOT NULL,
  status text NOT NULL, -- 'pending', 'succeeded', 'failed'
  amount numeric NOT NULL,
  currency text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON public.external_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_external_payments_user_id ON public.external_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_external_payments_provider_id ON public.external_payments(provider_payment_id);