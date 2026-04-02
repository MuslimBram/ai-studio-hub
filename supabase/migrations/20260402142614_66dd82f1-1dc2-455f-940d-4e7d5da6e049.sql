
-- Add base_price column to tools
ALTER TABLE public.tools ADD COLUMN base_price numeric NOT NULL DEFAULT 0;

-- Create tool_purchases table
CREATE TABLE public.tool_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  amount numeric NOT NULL,
  commission numeric NOT NULL,
  paypal_order_id text,
  paypal_payer_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view own purchases
CREATE POLICY "Users can view own purchases" ON public.tool_purchases
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" ON public.tool_purchases
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER update_tool_purchases_updated_at
  BEFORE UPDATE ON public.tool_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
