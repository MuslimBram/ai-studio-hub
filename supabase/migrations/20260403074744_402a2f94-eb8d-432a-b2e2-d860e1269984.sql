
-- Remove duplicate triggers (keep only the properly named ones)
DROP TRIGGER IF EXISTS enforce_social_account_plan_limit ON public.social_accounts;
DROP TRIGGER IF EXISTS ensure_single_primary_social_account ON public.social_accounts;

-- The three remaining triggers are correctly named:
-- social_accounts_normalize_state
-- social_accounts_single_primary  
-- social_accounts_plan_limit
