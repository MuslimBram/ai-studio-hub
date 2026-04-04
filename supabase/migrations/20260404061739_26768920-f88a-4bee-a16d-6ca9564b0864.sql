
CREATE TABLE public.ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT '',
  subcategory text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  is_free boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  logo_url text NOT NULL DEFAULT '',
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- Anyone can read tools
CREATE POLICY "AI tools are publicly readable"
ON public.ai_tools FOR SELECT TO public USING (true);

-- Authenticated users can submit tools
CREATE POLICY "Authenticated users can submit tools"
ON public.ai_tools FOR INSERT TO authenticated
WITH CHECK (true);

-- Only admins can update/delete
CREATE POLICY "Admins can update ai_tools"
ON public.ai_tools FOR UPDATE TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete ai_tools"
ON public.ai_tools FOR DELETE TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE TRIGGER update_ai_tools_updated_at
BEFORE UPDATE ON public.ai_tools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
