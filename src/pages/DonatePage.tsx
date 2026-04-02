import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { DonationCard } from '@/components/DonationCard';
import { useDonationStats, useCaptureDonation } from '@/hooks/useDonations';
import { Heart, Users, TrendingUp, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';

const bonusFeatures = [
  { icon: Sparkles, title: 'Badge Donatori', desc: 'Badge speciale në profilin tuaj që tregon mbështetjen' },
  { icon: Shield, title: 'Akses i hershëm', desc: 'Qasje e hershme në mjete të reja përpara lansimit publik' },
  { icon: Zap, title: 'Prioritet në sugjerimet', desc: 'Sugjerime me prioritet për mjete të reja në platformë' },
];

export default function DonatePage() {
  const { data: stats } = useDonationStats();
  const [searchParams] = useSearchParams();
  const captureDonation = useCaptureDonation();

  // Handle PayPal return
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !captureDonation.isSuccess && !captureDonation.isPending) {
      captureDonation.mutate(token);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-16">
        <div className="container text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-3">
            Mbështetni AI Tools Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platforma jonë është plotësisht falas. Donacionet tuaja na ndihmojnë të mbajmë serverat, 
            të shtojmë mjete të reja, dhe të përmirësojmë përvojën për të gjithë.
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && stats.totalCount > 0 && (
        <div className="container -mt-6">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="rounded-xl border bg-card p-4 text-center shadow-card">
              <Users className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats.totalCount}</div>
              <div className="text-xs text-muted-foreground">Donatorë</div>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center shadow-card">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats.totalAmount.toFixed(0)}€</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left - Donation form */}
          <div>
            <DonationCard />
          </div>

          {/* Right - Bonus features */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Veçori bonus për donatorët 🎁
              </h2>
              <p className="text-muted-foreground">
                Si falënderim, donatorët marrin këto përparësi ekskluzive:
              </p>
            </div>

            <div className="space-y-4">
              {bonusFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Success state */}
            {captureDonation.isSuccess && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">Faleminderit! 🎉</h3>
                <p className="text-muted-foreground">
                  Donacioni juaj u pranua me sukses. Ju jeni tani pjesë e komunitetit tonë të mbështetësve!
                </p>
                <Link to="/profile" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Shiko profilin tuaj →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 AI Tools Hub. Të gjitha të drejtat e rezervuara.
        </div>
      </footer>
    </div>
  );
}
