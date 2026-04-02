CREATE OR REPLACE FUNCTION public.count_active_channel_accounts(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.social_accounts
  WHERE user_id = _user_id
    AND status IN ('connected', 'reconnect_required', 'pending')
    AND COALESCE(is_connected, false) = true
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_primary_social_account()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_primary AND COALESCE(NEW.status, 'connected') <> 'deleted' THEN
    UPDATE public.social_accounts
    SET is_primary = false,
        updated_at = now()
    WHERE user_id = NEW.user_id
      AND channel_type = NEW.channel_type
      AND id <> COALESCE(NEW.id, gen_random_uuid())
      AND COALESCE(status, 'connected') <> 'deleted';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_social_account_state()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'deleted' THEN
    NEW.is_connected := false;
    NEW.is_primary := false;
  ELSIF COALESCE(NEW.is_connected, false) = false THEN
    IF COALESCE(NEW.status, '') NOT IN ('reconnect_required', 'disconnected', 'deleted', 'failed') THEN
      NEW.status := 'disconnected';
    END IF;
    NEW.is_primary := false;
  ELSE
    IF COALESCE(NEW.status, '') = '' OR NEW.status IS NULL OR NEW.status = 'disconnected' THEN
      NEW.status := 'connected';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS social_accounts_normalize_state ON public.social_accounts;
CREATE TRIGGER social_accounts_normalize_state
BEFORE INSERT OR UPDATE ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.normalize_social_account_state();

DROP TRIGGER IF EXISTS social_accounts_single_primary ON public.social_accounts;
CREATE TRIGGER social_accounts_single_primary
BEFORE INSERT OR UPDATE OF is_primary, status, is_connected, channel_type ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_primary_social_account();

DROP TRIGGER IF EXISTS social_accounts_plan_limit ON public.social_accounts;
CREATE TRIGGER social_accounts_plan_limit
BEFORE INSERT OR UPDATE OF status, is_connected, user_id ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_social_account_plan_limit();

UPDATE public.social_accounts
SET status = CASE
  WHEN status = 'deleted' THEN 'deleted'
  WHEN COALESCE(is_connected, false) = false AND status IN ('connected', 'pending', '') THEN 'disconnected'
  WHEN COALESCE(is_connected, false) = true AND (status IS NULL OR status = '' OR status = 'disconnected') THEN 'connected'
  ELSE status
END,
    is_primary = CASE
      WHEN status = 'deleted' OR COALESCE(is_connected, false) = false THEN false
      ELSE is_primary
    END;