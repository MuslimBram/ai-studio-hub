import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { DonorBadge } from '@/components/DonorBadge';

interface AdminProfile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_donor: boolean;
  total_donated: number;
  donor_since: string | null;
  created_at: string;
  roles: string[];
}

export default function AdminUsers() {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Përdoruesit</h1>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Emri</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Rolet</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Donator</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Total Dhuruar</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regjistruar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{p.display_name || '—'}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{p.bio || ''}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {p.roles.length > 0
                        ? p.roles.map(r => <Badge key={r} variant={r === 'admin' ? 'default' : 'outline'}>{r}</Badge>)
                        : <Badge variant="outline">user</Badge>
                      }
                    </div>
                  </td>
                  <td className="p-3">
                    {p.is_donor ? <DonorBadge totalDonated={Number(p.total_donated)} /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 text-foreground">{Number(p.total_donated) > 0 ? `${Number(p.total_donated).toFixed(2)}€` : '—'}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('sq-AL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profiles.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground">Nuk ka përdorues ende.</div>
        )}
      </div>
    </AdminLayout>
  );
}
