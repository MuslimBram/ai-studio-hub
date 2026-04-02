import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { DonorBadge } from '@/components/DonorBadge';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Loader2, Heart } from 'lucide-react';
import { useMyDonations } from '@/hooks/useDonations';
import { useSEO } from '@/hooks/useSEO';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isDonor, setIsDonor] = useState(false);
  const [totalDonated, setTotalDonated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { data: myDonations } = useMyDonations();

  useSEO({ title: 'Profili Im' });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
          setIsDonor(data.is_donor || false);
          setTotalDonated(Number(data.total_donated) || 0);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Gabim', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'U ruajt', description: 'Profili u përditësua me sukses.' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 max-w-lg">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container py-12 max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-foreground">Profili Im</h1>
          {isDonor && <DonorBadge totalDonated={totalDonated} size="md" />}
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-card">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="name">Emri</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Emri juaj" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Shkruani diçka për veten..." rows={4} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ruaj Ndryshimet
            </Button>
          </form>
        </div>

        {/* Donation history */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Donacionet e mia</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/donate"><Heart className="h-4 w-4 mr-1" />Dhuro</Link>
            </Button>
          </div>

          {myDonations && myDonations.length > 0 ? (
            <div className="space-y-2">
              {myDonations.map((d) => (
                <div key={d.id} className="rounded-lg border bg-card p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">{Number(d.amount).toFixed(2)}€</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString('sq-AL')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {d.status === 'completed' ? 'Pranuar' : 'Në pritje'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nuk keni bërë ende asnjë donacion.</p>
              <Link to="/donate" className="text-sm text-primary hover:underline mt-1 inline-block">
                Bëhuni mbështetës →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
