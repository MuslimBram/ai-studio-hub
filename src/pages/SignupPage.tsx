import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  useSEO({ title: t('signup_title'), description: t('signup_title') });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: t('error_title'), description: t('error_fill_email_password'), variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: t('error_title'), description: t('signup_password_min'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: t('error_title'), description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container flex items-center justify-center py-20 flex-1">
          <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">{t('signup_verify_title')}</h1>
            <p className="text-muted-foreground">
              {t('signup_verify_text')} <strong className="text-foreground">{email}</strong>.
            </p>
            <Link to="/login" className="mt-6 inline-block text-primary hover:underline">{t('signup_verify_back')}</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container flex items-center justify-center py-20 flex-1">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card">
          <h1 className="mb-6 text-2xl font-bold text-foreground text-center">{t('signup_title')}</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('signup_name')}</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('signup_name_placeholder')} />
            </div>
            <div>
              <Label htmlFor="email">{t('login_email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email_placeholder')} />
            </div>
            <div>
              <Label htmlFor="password">{t('login_password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 karaktere" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('signup_button')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('signup_has_account')}{' '}
            <Link to="/login" className="text-primary hover:underline">{t('nav_login')}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
