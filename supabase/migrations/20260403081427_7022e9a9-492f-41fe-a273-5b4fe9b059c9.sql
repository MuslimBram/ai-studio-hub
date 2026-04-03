
-- ============================================================
-- Analytics Module Phase 1: Core tables
-- ============================================================

-- Social analytics snapshots (daily aggregated metrics per account)
CREATE TABLE IF NOT EXISTS public.social_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL DEFAULT '',
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  followers integer NOT NULL DEFAULT 0,
  following integer NOT NULL DEFAULT 0,
  total_posts integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  engagement integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  profile_views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (social_account_id, snapshot_date)
);

ALTER TABLE public.social_analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON public.social_analytics_snapshots
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all snapshots" ON public.social_analytics_snapshots
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Users can insert own snapshots" ON public.social_analytics_snapshots
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Social post metrics (per-post performance)
CREATE TABLE IF NOT EXISTS public.social_post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  published_post_id uuid REFERENCES public.published_posts(id) ON DELETE SET NULL,
  external_post_id text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  post_type text NOT NULL DEFAULT 'text',
  content_preview text NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL DEFAULT now(),
  reach integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own post metrics" ON public.social_post_metrics
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all post metrics" ON public.social_post_metrics
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Users can insert own post metrics" ON public.social_post_metrics
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own post metrics" ON public.social_post_metrics
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Social reports
CREATE TABLE IF NOT EXISTS public.social_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  report_type text NOT NULL DEFAULT 'weekly',
  platform_filter text NOT NULL DEFAULT 'all',
  date_from date NOT NULL DEFAULT CURRENT_DATE,
  date_to date NOT NULL DEFAULT CURRENT_DATE,
  summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reports" ON public.social_reports
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.social_reports
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

-- Social tags for content labeling
CREATE TABLE IF NOT EXISTS public.social_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.social_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tags" ON public.social_tags
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Post-tag junction
CREATE TABLE IF NOT EXISTS public.social_post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_metric_id uuid REFERENCES public.social_post_metrics(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.social_tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_metric_id, tag_id)
);

ALTER TABLE public.social_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own post tags" ON public.social_post_tags
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.social_post_metrics m WHERE m.id = post_metric_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.social_post_metrics m WHERE m.id = post_metric_id AND m.user_id = auth.uid()));

-- Social insights (AI-generated recommendations)
CREATE TABLE IF NOT EXISTS public.social_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  insight_type text NOT NULL DEFAULT 'general',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  platform text NOT NULL DEFAULT 'all',
  is_read boolean NOT NULL DEFAULT false,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insights" ON public.social_insights
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
