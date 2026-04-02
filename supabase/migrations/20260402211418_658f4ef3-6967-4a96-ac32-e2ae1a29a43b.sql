CREATE OR REPLACE FUNCTION public.enforce_social_account_plan_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  active_count integer;
  max_allowed integer;
BEGIN
  IF NEW.status = 'deleted' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND COALESCE(OLD.status, 'connected') <> 'deleted'
     AND OLD.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  IF public.is_admin_user(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  SELECT p.max_channels
  INTO max_allowed
  FROM public.user_subscriptions us
  JOIN public.plans p ON p.id = us.plan_id
  WHERE us.user_id = NEW.user_id
    AND us.status = 'active'
  ORDER BY us.started_at DESC
  LIMIT 1;

  IF max_allowed IS NULL THEN
    SELECT max_channels INTO max_allowed
    FROM public.plans
    WHERE id = 'plan-free'
    LIMIT 1;
  END IF;

  active_count := public.count_active_channel_accounts(NEW.user_id);

  IF active_count >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'You have reached your plan limit: %/% connected channels.', active_count, max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_social_account_plan_limit ON public.social_accounts;
CREATE TRIGGER enforce_social_account_plan_limit
BEFORE INSERT OR UPDATE OF status, user_id
ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_social_account_plan_limit();