import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MfaChallenge } from '@/components/MfaChallenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useSEO({ title: 'Kyçu', description: 'Kyçuni në llogarinë tuaj në AI Tools Hub.' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Gabim', description: 'Plotësoni të gjitha fushat.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
      return;
    }

    // Check if MFA is enrolled
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') || [];

    if (verifiedFactors.length > 0) {
      // MFA required
      setMfaFactorId(verifiedFactors[0].id);
    } else {
      toast({ title: 'Sukses', description: 'U kyçët me sukses!' });
      navigate('/');
    }
  };

  const handleMfaSuccess = () => {
    toast({ title: 'Sukses', description: 'U kyçët me sukses!' });
    navigate('/');
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setMfaFactorId(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container flex items-center justify-center py-20 flex-1">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card">
          {mfaFactorId ? (
            <MfaChallenge
              factorId={mfaFactorId}
              onSuccess={handleMfaSuccess}
              onCancel={handleMfaCancel}
            />
          ) : (
            <>
              <h1 className="mb-6 text-2xl font-bold text-foreground text-center">Kyçu</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@shembull.com" />
                </div>
                <div>
                  <Label htmlFor="password">Fjalëkalimi</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Kyçu
                </Button>
              </form>
              <div className="mt-4 flex flex-col gap-2 text-center text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">Keni harruar fjalëkalimin?</Link>
                <span className="text-muted-foreground">
                  Nuk keni llogari?{' '}
                  <Link to="/signup" className="text-primary hover:underline">Regjistrohu</Link>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
