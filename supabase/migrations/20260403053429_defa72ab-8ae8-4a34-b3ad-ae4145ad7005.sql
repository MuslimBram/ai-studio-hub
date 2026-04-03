-- Re-create all social_accounts triggers
CREATE OR REPLACE TRIGGER social_accounts_normalize_state
BEFORE INSERT OR UPDATE ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.normalize_social_account_state();

CREATE OR REPLACE TRIGGER social_accounts_single_primary
BEFORE INSERT OR UPDATE OF is_primary, status, is_connected, channel_type ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_primary_social_account();

CREATE OR REPLACE TRIGGER social_accounts_plan_limit
BEFORE INSERT ON public.social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_social_account_plan_limit();