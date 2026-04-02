import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MfaSetup } from './MfaSetup';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ShieldAlert } from 'lucide-react';

/**
 * MfaGuard: wraps protected routes.
 * If the user is logged in but has NOT enrolled 2FA, forces them to set it up.
 */
export function MfaGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasMfa, setHasMfa] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const checkMfa = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.filter(f => f.status === 'verified') || [];
      setHasMfa(verified.length > 0);
      setChecking(false);
    };
    checkMfa();
  }, [user, authLoading, navigate, setupComplete]);

  if (authLoading || checking) {
    return null; // brief loading
  }

  if (!user) return null;

  // If MFA not enrolled, force setup
  if (!hasMfa) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container flex items-center justify-center py-20 flex-1">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">2FA e Detyrueshme</h1>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Për sigurinë, duhet të aktivizoni autentifikimin dy-faktorësh (2FA) përpara se të vazhdoni.
            </p>
            <MfaSetup onComplete={() => setSetupComplete(prev => !prev)} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
