import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function AdminUsers() {
  // Fetch profiles (admins can see via service role, but profiles RLS only shows own)
  // For a full admin user list, we query profiles that the admin can see
  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      // Admin can only see their own profile via RLS. For full user management,
      // we'd need an edge function. For now, show what's accessible.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
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
                <th className="text-left p-3 font-medium text-muted-foreground">Bio</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Donator</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regjistruar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium text-foreground">{p.display_name || '—'}</td>
                  <td className="p-3 text-muted-foreground max-w-[300px] truncate">{p.bio || '—'}</td>
                  <td className="p-3">
                    {p.is_donor ? <Badge>Donator</Badge> : <Badge variant="outline">Jo</Badge>}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('sq-AL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {profiles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Nuk ka përdorues ende.</div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        * Për menaxhim të plotë të përdoruesve, nevojitet akses i zgjeruar nga paneli i backend-it.
      </p>
    </AdminLayout>
  );
}
