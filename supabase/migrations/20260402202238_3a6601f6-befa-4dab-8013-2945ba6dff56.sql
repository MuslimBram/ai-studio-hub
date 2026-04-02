
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS connection_mode text NOT NULL DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS capabilities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
