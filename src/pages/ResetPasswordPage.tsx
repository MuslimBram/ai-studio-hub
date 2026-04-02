import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Gabim', description: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sukses', description: 'Fjalëkalimi u ndryshua me sukses!' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card">
          <h1 className="mb-6 text-2xl font-bold text-foreground text-center">Fjalëkalim i Ri</h1>
          {!ready ? (
            <p className="text-center text-muted-foreground">Duke verifikuar linkun...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Fjalëkalimi i ri</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 karaktere" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Rivendos Fjalëkalimin
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
