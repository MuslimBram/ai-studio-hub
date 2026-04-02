import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Gabim', description: 'Vendosni email-in tuaj.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex items-center justify-center py-20">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Kontrolloni Email-in</h1>
            <p className="text-muted-foreground">Nëse llogaria ekziston, kemi dërguar udhëzime për rivendosjen e fjalëkalimit.</p>
            <Link to="/login" className="mt-6 inline-block text-primary hover:underline">Kthehu te kyçja</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card">
          <h1 className="mb-6 text-2xl font-bold text-foreground text-center">Rivendos Fjalëkalimin</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@shembull.com" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Dërgo Linkun
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Kthehu te kyçja</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
