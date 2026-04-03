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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  useSEO({ title: t('forgot_title') });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: t('error_title'), description: t('error_fill_all'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
            <h1 className="mb-4 text-2xl font-bold text-foreground">{t('forgot_sent')}</h1>
            <p className="text-muted-foreground">{t('forgot_sent_desc')}</p>
            <Link to="/login" className="mt-6 inline-block text-primary hover:underline">{t('forgot_back')}</Link>
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
          <h1 className="mb-6 text-2xl font-bold text-foreground text-center">{t('forgot_title')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('login_email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email_placeholder')} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('forgot_send')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">{t('forgot_back')}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
