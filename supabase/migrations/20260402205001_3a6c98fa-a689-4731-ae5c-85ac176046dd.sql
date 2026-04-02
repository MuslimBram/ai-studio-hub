
-- Plans table
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  max_channels integer NOT NULL DEFAULT 5,
  ai_replies_per_day integer NOT NULL DEFAULT 25,
  ai_text_generations_per_day integer NOT NULL DEFAULT 10,
  ai_image_generations_per_day integer NOT NULL DEFAULT 0,
  ai_video_generations_per_day integer NOT NULL DEFAULT 0,
  ai_features_enabled text[] NOT NULL DEFAULT '{}',
  features_enabled text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are publicly readable" ON public.plans FOR SELECT TO public USING (true);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- AI usage tracking
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL DEFAULT 'general',
  action_type text NOT NULL DEFAULT 'reply',
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own AI usage" ON public.ai_usage_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own AI usage" ON public.ai_usage_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all AI usage" ON public.ai_usage_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Daily usage summary view function
CREATE OR REPLACE FUNCTION public.get_ai_usage_today(_user_id uuid)
RETURNS TABLE(category text, action_type text, usage_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT category, action_type, COUNT(*) as usage_count
  FROM public.ai_usage_logs
  WHERE user_id = _user_id
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
  GROUP BY category, action_type
$$;

-- Insert default plans
INSERT INTO public.plans (id, name, slug, description, price_monthly, price_yearly, max_channels, ai_replies_per_day, ai_text_generations_per_day, ai_image_generations_per_day, ai_video_generations_per_day, ai_features_enabled, features_enabled, display_order) VALUES
('plan-free', 'Falas', 'free', 'Për individë që duan të provojnë platformën', 0, 0, 2, 10, 5, 0, 0, ARRAY['basic_reply', 'content_ai'], ARRAY['basic_tools', 'basic_analytics'], 0),
('plan-individ', 'Individ', 'individ', 'Për krijues individualë dhe freelancerë', 9.99, 99, 5, 25, 15, 3, 0, ARRAY['basic_reply', 'content_ai', 'inbox_ai', 'media_ai'], ARRAY['basic_tools', 'basic_analytics', 'scheduler', 'content_engine'], 1),
('plan-biznes', 'Biznes', 'biznes', 'Për biznese të vogla dhe mesme', 29.99, 299, 9, 75, 40, 10, 3, ARRAY['basic_reply', 'content_ai', 'inbox_ai', 'media_ai', 'strategy_ai', 'automation_ai'], ARRAY['basic_tools', 'advanced_analytics', 'scheduler', 'content_engine', 'competitor_analysis', 'team_management'], 2),
('plan-pro', 'Pro', 'pro', 'Për agjenci dhe ekipe profesionale', 79.99, 799, 20, 200, 100, 30, 10, ARRAY['basic_reply', 'content_ai', 'inbox_ai', 'media_ai', 'strategy_ai', 'automation_ai', 'campaign_ai'], ARRAY['basic_tools', 'advanced_analytics', 'scheduler', 'content_engine', 'competitor_analysis', 'team_management', 'white_label', 'api_access'], 3),
('plan-enterprise', 'Enterprise', 'enterprise', 'Për organizata të mëdha me nevoja të avancuara', 199.99, 1999, 100, 1000, 500, 100, 50, ARRAY['basic_reply', 'content_ai', 'inbox_ai', 'media_ai', 'strategy_ai', 'automation_ai', 'campaign_ai', 'custom_ai'], ARRAY['basic_tools', 'advanced_analytics', 'scheduler', 'content_engine', 'competitor_analysis', 'team_management', 'white_label', 'api_access', 'sso', 'dedicated_support'], 4);
