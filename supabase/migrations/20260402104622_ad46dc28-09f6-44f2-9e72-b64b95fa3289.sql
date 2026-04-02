
-- Create categories table
CREATE TABLE public.categories (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  color_class TEXT NOT NULL DEFAULT '',
  bg_color_class TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id TEXT NOT NULL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Create tools table
CREATE TABLE public.tools (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  subcategory_id TEXT NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT '',
  model_type TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  badge TEXT CHECK (badge IN ('new', 'popular', 'featured', 'official', NULL)),
  pricing_type TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'freemium', 'paid', 'enterprise')),
  pricing_text TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_official BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  features TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  input_types TEXT[] NOT NULL DEFAULT '{}',
  output_types TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tool_examples table
CREATE TABLE public.tool_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_examples ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (this is a public directory)
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Subcategories are publicly readable" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Tools are publicly readable" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Tool examples are publicly readable" ON public.tool_examples FOR SELECT USING (true);

-- Indexes for common queries
CREATE INDEX idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX idx_tools_category_id ON public.tools(category_id);
CREATE INDEX idx_tools_subcategory_id ON public.tools(subcategory_id);
CREATE INDEX idx_tools_is_featured ON public.tools(is_featured) WHERE is_featured = true;
CREATE INDEX idx_tools_is_popular ON public.tools(is_popular) WHERE is_popular = true;
CREATE INDEX idx_tools_is_official ON public.tools(is_official) WHERE is_official = true;
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_tags ON public.tools USING GIN(tags);
CREATE INDEX idx_tool_examples_tool_id ON public.tool_examples(tool_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
