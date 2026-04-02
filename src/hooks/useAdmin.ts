import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.functions.invoke('check-admin');
      if (error) return false;
      return data?.isAdmin === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
