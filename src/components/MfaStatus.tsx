import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { MfaSetup } from './MfaSetup';

export function MfaStatus() {
  const [hasMfa, setHasMfa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const checkMfa = async () => {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.filter(f => f.status === 'verified') || [];
    setHasMfa(verified.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    checkMfa();
  }, []);

  const handleDisable = async () => {
    setDisabling(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.filter(f => f.status === 'verified') || [];
      for (const factor of verified) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setHasMfa(false);
      toast({ title: 'Sukses', description: '2FA u çaktivizua.' });
    } catch (err: any) {
      toast({ title: 'Gabim', description: err.message, variant: 'destructive' });
    }
    setDisabling(false);
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Duke kontrolluar 2FA...</span>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <MfaSetup onComplete={() => { setShowSetup(false); checkMfa(); }} />
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasMfa ? (
            <ShieldCheck className="h-5 w-5 text-primary" />
          ) : (
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-semibold text-foreground">
              {hasMfa ? '2FA Aktive' : '2FA Jo Aktive'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasMfa
                ? 'Llogaria juaj është e mbrojtur me autentifikim dy-faktorësh.'
                : 'Aktivizoni 2FA për siguri shtesë.'}
            </p>
          </div>
        </div>
        {hasMfa ? (
          <Button variant="outline" size="sm" onClick={handleDisable} disabled={disabling}>
            {disabling && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Çaktivizo
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowSetup(true)}>
            Aktivizo 2FA
          </Button>
        )}
      </div>
    </div>
  );
}
