
-- Re-create the trigger for auto-creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant admin role to owner account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'amirah.br0006@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
