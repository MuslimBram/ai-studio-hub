
-- Social accounts connected by users
CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL, -- facebook, instagram, linkedin
  account_name text NOT NULL DEFAULT '',
  account_id text NOT NULL DEFAULT '',
  access_token text NOT NULL DEFAULT '',
  refresh_token text DEFAULT '',
  token_expires_at timestamptz,
  is_connected boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social accounts" ON public.social_accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own social accounts" ON public.social_accounts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own social accounts" ON public.social_accounts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own social accounts" ON public.social_accounts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Scheduled posts
CREATE TABLE public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  media_urls text[] NOT NULL DEFAULT '{}',
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- draft, scheduled, published, failed
  platform text NOT NULL DEFAULT '',
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text DEFAULT '', -- daily, weekly, monthly
  hashtags text[] NOT NULL DEFAULT '{}',
  ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled posts" ON public.scheduled_posts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own scheduled posts" ON public.scheduled_posts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own scheduled posts" ON public.scheduled_posts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own scheduled posts" ON public.scheduled_posts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Content suggestions from AI
CREATE TABLE public.content_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  suggestion_type text NOT NULL DEFAULT 'caption', -- caption, hashtag, topic, campaign
  content text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'professional', -- professional, casual, sales
  keywords text[] NOT NULL DEFAULT '{}',
  platform text NOT NULL DEFAULT '',
  score numeric NOT NULL DEFAULT 0,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" ON public.content_suggestions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own suggestions" ON public.content_suggestions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own suggestions" ON public.content_suggestions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own suggestions" ON public.content_suggestions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Competitor data
CREATE TABLE public.competitor_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  competitor_name text NOT NULL DEFAULT '',
  competitor_url text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  top_posts jsonb NOT NULL DEFAULT '[]',
  keywords text[] NOT NULL DEFAULT '{}',
  posting_frequency text NOT NULL DEFAULT '',
  content_gaps text[] NOT NULL DEFAULT '{}',
  suggested_topics text[] NOT NULL DEFAULT '{}',
  last_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.competitor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitor data" ON public.competitor_data
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own competitor data" ON public.competitor_data
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own competitor data" ON public.competitor_data
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own competitor data" ON public.competitor_data
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Published posts tracking
CREATE TABLE public.published_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scheduled_post_id uuid REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  media_urls text[] NOT NULL DEFAULT '{}',
  external_post_id text DEFAULT '',
  engagement_likes integer NOT NULL DEFAULT 0,
  engagement_comments integer NOT NULL DEFAULT 0,
  engagement_shares integer NOT NULL DEFAULT 0,
  engagement_clicks integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.published_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own published posts" ON public.published_posts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own published posts" ON public.published_posts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own published posts" ON public.published_posts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Admins can view all content engine data
CREATE POLICY "Admins can view all social accounts" ON public.social_accounts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all scheduled posts" ON public.scheduled_posts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all published posts" ON public.published_posts
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
