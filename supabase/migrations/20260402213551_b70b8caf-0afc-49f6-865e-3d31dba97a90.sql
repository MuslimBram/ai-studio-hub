CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = _user_id
        AND email = 'amirah.br0006@gmail.com'
    )
$$;

CREATE UNIQUE INDEX IF NOT EXISTS social_accounts_user_provider_external_active_idx
ON public.social_accounts (user_id, provider, external_account_id)
WHERE status <> 'deleted' AND external_account_id <> '';