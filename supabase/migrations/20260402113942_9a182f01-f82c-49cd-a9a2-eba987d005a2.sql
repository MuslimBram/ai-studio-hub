
-- Donations table to track PayPal donations
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  paypal_order_id text,
  paypal_payer_id text,
  status text NOT NULL DEFAULT 'pending',
  message text DEFAULT '',
  donor_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Users can view their own donations
CREATE POLICY "Users can view own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow insert from service role (edge function) - no direct client inserts
-- Public can read aggregate stats (total donations count)
CREATE POLICY "Public can read donation stats"
  ON public.donations FOR SELECT
  TO public
  USING (status = 'completed');

-- Trigger for updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_donor column to profiles for quick lookup
ALTER TABLE public.profiles ADD COLUMN is_donor boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN total_donated numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN donor_since timestamptz;
