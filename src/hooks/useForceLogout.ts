import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Forces logout between 03:00 and 05:00 UTC daily.
 * Checks every 60 seconds.
 */
export function useForceLogout() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const check = () => {
      const now = new Date();
      const hour = now.getUTCHours();
      if (hour >= 3 && hour < 5) {
        supabase.auth.signOut();
      }
    };

    // Check immediately
    check();

    // Check every 60 seconds
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [user]);
}
