import { AdminLayout } from '@/components/AdminLayout';
import { useDonationStats } from '@/hooks/useDonations';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp } from 'lucide-react';

export default function AdminDonations() {
  const { data: stats } = useDonationStats();

  // Admin can see all completed donations via public RLS policy
  const { data: donations = [] } = useQuery({
    queryKey: ['admin-donations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Donacionet</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <Heart className="h-5 w-5 text-destructive mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats?.totalCount || 0}</div>
          <span className="text-sm text-muted-foreground">Total donacione</span>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <TrendingUp className="h-5 w-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{(stats?.totalAmount || 0).toFixed(2)}€</div>
          <span className="text-sm text-muted-foreground">Total i mbledhur</span>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <TrendingUp className="h-5 w-5 text-accent mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {stats?.totalCount ? (stats.totalAmount / stats.totalCount).toFixed(2) : '0'}€
          </div>
          <span className="text-sm text-muted-foreground">Mesatare</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Donatori</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Shuma</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Mesazhi</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Statusi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-muted/50">
                  <td className="p-3 text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString('sq-AL')}
                  </td>
                  <td className="p-3 font-medium text-foreground">{d.donor_name || 'Anonim'}</td>
                  <td className="p-3 text-muted-foreground">{d.email}</td>
                  <td className="p-3 font-medium text-foreground">{Number(d.amount).toFixed(2)}€</td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">{d.message || '—'}</td>
                  <td className="p-3">
                    <Badge variant={d.status === 'completed' ? 'default' : 'outline'}>
                      {d.status === 'completed' ? 'Pranuar' : d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {donations.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Nuk ka donacione ende.</div>
        )}
      </div>
    </AdminLayout>
  );
}
