ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS business_id uuid,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS channel_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_account_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS handle_or_address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'connected',
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS capabilities_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.social_accounts
SET
  provider = COALESCE(NULLIF(provider, ''), platform),
  channel_type = COALESCE(NULLIF(channel_type, ''), platform),
  display_name = COALESCE(NULLIF(display_name, ''), account_name),
  external_account_id = COALESCE(NULLIF(external_account_id, ''), account_id),
  handle_or_address = COALESCE(NULLIF(handle_or_address, ''), account_id),
  status = CASE
    WHEN status = '' THEN CASE WHEN is_connected THEN 'connected' ELSE 'disconnected' END
    ELSE status
  END,
  capabilities_json = CASE
    WHEN capabilities_json = '[]'::jsonb THEN to_jsonb(capabilities)
    ELSE capabilities_json
  END,
  metadata_json = CASE
    WHEN metadata_json = '{}'::jsonb THEN provider_metadata
    ELSE metadata_json
  END
WHERE true;

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.count_active_channel_accounts(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.social_accounts
  WHERE user_id = _user_id
    AND status <> 'deleted'
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_primary_social_account()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE public.social_accounts
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND channel_type = NEW.channel_type
      AND id <> COALESCE(NEW.id, gen_random_uuid());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_single_primary_social_account ON public.social_accounts;
CREATE TRIGGER ensure_single_primary_social_account
BEFORE INSERT OR UPDATE OF is_primary, channel_type, user_id
ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_primary_social_account();

DROP INDEX IF EXISTS social_accounts_unique_external_per_user_idx;
CREATE UNIQUE INDEX social_accounts_unique_external_per_user_idx
ON public.social_accounts (user_id, provider, external_account_id)
WHERE external_account_id <> '' AND status <> 'deleted';

DROP INDEX IF EXISTS social_accounts_unique_address_per_user_idx;
CREATE UNIQUE INDEX social_accounts_unique_address_per_user_idx
ON public.social_accounts (user_id, provider, handle_or_address)
WHERE handle_or_address <> '' AND status <> 'deleted';

CREATE INDEX IF NOT EXISTS social_accounts_user_status_idx
ON public.social_accounts (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS social_accounts_user_channel_type_idx
ON public.social_accounts (user_id, channel_type);

ALTER TABLE public.social_accounts
  DROP CONSTRAINT IF EXISTS social_accounts_status_check;

ALTER TABLE public.social_accounts
  ADD CONSTRAINT social_accounts_status_check
  CHECK (status IN ('connected', 'disconnected', 'error', 'reconnect_required', 'deleted'));

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all social accounts" ON public.social_accounts;
CREATE POLICY "Admins can view all social accounts"
ON public.social_accounts
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all social accounts" ON public.social_accounts;
CREATE POLICY "Admins can manage all social accounts"
ON public.social_accounts
FOR ALL
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));