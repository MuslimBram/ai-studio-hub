import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DonationCard } from '@/components/DonationCard';
import { useDonationStats, useCaptureDonation } from '@/hooks/useDonations';
import { Heart, Users, TrendingUp, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DonatePage() {
  const { data: stats } = useDonationStats();
  const [searchParams] = useSearchParams();
  const captureDonation = useCaptureDonation();
  const { t } = useLanguage();

  useSEO({ title: t('nav_donate'), description: t('donate_subtitle') });

  const status = searchParams.get('status');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token && status === 'success' && !captureDonation.isSuccess && !captureDonation.isPending) {
      captureDonation.mutate(token);
    }
  }, [token, status]);

  const bonusFeatures = [
    { icon: Sparkles, title: t('donate_badge_title'), desc: t('donate_badge_desc') },
    { icon: Shield, title: t('donate_early_title'), desc: t('donate_early_desc') },
    { icon: Zap, title: t('donate_priority_title'), desc: t('donate_priority_desc') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-16">
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6"><Heart className="h-8 w-8 text-primary" /></div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">{t('donate_title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('donate_subtitle')}</p>
        </div>
      </div>

      {stats && stats.totalCount > 0 && (
        <div className="container -mt-6">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-xl border bg-card p-4 text-center shadow-card">
              <Users className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats.totalCount}</div>
              <div className="text-xs text-muted-foreground">{t('donate_donors')}</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-card">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats.totalAmount.toFixed(0)}€</div>
              <div className="text-xs text-muted-foreground">{t('donate_total')}</div>
            </div>
          </div>
        </div>
      )}

      <div className="container py-12 flex-1">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div><DonationCard /></div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t('donate_bonus_title')}</h2>
              <p className="text-muted-foreground">{t('donate_bonus_subtitle')}</p>
            </div>
            <div className="space-y-4">
              {bonusFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><feature.icon className="h-5 w-5 text-primary" /></div>
                  <div><h3 className="font-semibold text-foreground">{feature.title}</h3><p className="text-sm text-muted-foreground">{feature.desc}</p></div>
                </div>
              ))}
            </div>
            {captureDonation.isSuccess && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">{t('donate_thanks')}</h3>
                <p className="text-muted-foreground">{t('donate_thanks_desc')}</p>
                <Link to="/profile" className="mt-3 inline-block text-sm text-primary hover:underline">{t('donate_view_profile')}</Link>
              </div>
            )}
            {status === 'cancelled' && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">{t('donate_cancelled')}</h3>
                <p className="text-muted-foreground">{t('donate_cancelled_desc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
