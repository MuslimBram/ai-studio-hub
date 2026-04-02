import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Copy, CheckCircle } from 'lucide-react';

interface MfaSetupProps {
  onComplete: () => void;
}

export function MfaSetup({ onComplete }: MfaSetupProps) {
  const [step, setStep] = useState<'start' | 'qr' | 'recovery' | 'done'>('start');
  const [qrUri, setQrUri] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'AI Tools Hub TOTP',
      });
      if (error) throw error;
      setQrUri(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('qr');
    } catch (err: any) {
      toast({ title: 'Gabim', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({ title: 'Gabim', description: 'Kodi duhet të ketë 6 shifra.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;

      // Generate recovery codes via edge function
      const { data: recoveryData, error: recoveryError } = await supabase.functions.invoke('generate-recovery-codes');
      if (recoveryError) {
        console.error('Recovery code generation failed:', recoveryError);
      }
      setRecoveryCodes(recoveryData?.codes || []);
      setStep('recovery');
      toast({ title: 'Sukses', description: '2FA u aktivizua me sukses!' });
    } catch (err: any) {
      toast({ title: 'Gabim', description: err.message || 'Verifikimi dështoi.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'start') {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Autentifikimi me dy faktorë (2FA)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Shtoni një shtresë ekstra sigurie duke aktivizuar 2FA me një aplikacion autentifikues (Google Authenticator, Authy, etj.)
        </p>
        <Button onClick={handleEnroll} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Aktivizo 2FA
        </Button>
      </div>
    );
  }

  if (step === 'qr') {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-lg font-bold text-foreground">Skanoni kodin QR</h3>
        <p className="text-sm text-muted-foreground">
          Hapni aplikacionin tuaj autentifikues dhe skanoni këtë kod QR:
        </p>
        <div className="flex justify-center py-4">
          <img src={qrUri} alt="QR Code" className="h-48 w-48 rounded-lg" />
        </div>
        <details className="text-sm">
          <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
            Nuk mund ta skanoni? Vendosni manualisht
          </summary>
          <code className="block mt-2 p-2 bg-muted rounded text-xs break-all">{secret}</code>
        </details>
        <form onSubmit={handleVerifyAndActivate} className="space-y-3 pt-2">
          <div>
            <Label htmlFor="verify-code">Vendosni kodin 6-shifror nga aplikacioni</Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verifiko dhe Aktivizo
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'recovery') {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">2FA u aktivizua!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Ruani këto kode rikuperimi në një vend të sigurt. Secili kod mund të përdoret vetëm një herë.
        </p>
        {recoveryCodes.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {recoveryCodes.map((code, i) => (
                <code key={i} className="text-sm font-mono text-foreground">{code}</code>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyCodes}>
              {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'U kopjua!' : 'Kopjo kodet'}
            </Button>
          </>
        )}
        <Button onClick={onComplete} className="w-full">Vazhdo</Button>
      </div>
    );
  }

  return null;
}
