-- Add unique constraint for analytics snapshot upsert
ALTER TABLE public.social_analytics_snapshots
ADD CONSTRAINT social_analytics_snapshots_account_date_unique
UNIQUE (social_account_id, snapshot_date);