import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DonorBadge } from '@/components/DonorBadge';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';

interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_donor: boolean;
  total_donated: number;
  donor_since: string | null;
  created_at: string;
  roles: string[];
}

const OWNER_EMAIL = 'amirah.br0006@gmail.com';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      return data || [];
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'grant' | 'revoke' }) => {
      const { data, error } = await supabase.functions.invoke('manage-admin-role', {
        body: { targetUserId: userId, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Sukses', description: 'Roli u përditësua.' });
    },
    onError: (err: any) => {
      toast({ title: 'Gabim', description: err.message, variant: 'destructive' });
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
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Rolet</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Donator</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Regjistruar</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map((p) => {
                const isOwner = p.email === OWNER_EMAIL;
                const isCurrentAdmin = p.roles.includes('admin');
                return (
                  <tr key={p.id} className="hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{p.display_name || '—'}</div>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{p.email}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {isOwner && <Badge className="bg-destructive text-destructive-foreground">owner</Badge>}
                        {p.roles.length > 0
                          ? p.roles.map(r => <Badge key={r} variant={r === 'admin' ? 'default' : 'outline'}>{r}</Badge>)
                          : <Badge variant="outline">user</Badge>
                        }
                      </div>
                    </td>
                    <td className="p-3">
                      {p.is_donor ? <DonorBadge totalDonated={Number(p.total_donated)} /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString('sq-AL')}
                    </td>
                    <td className="p-3">
                      {isOwner ? (
                        <span className="text-xs text-muted-foreground">Pronar i përjetshëm</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={isCurrentAdmin ? 'outline' : 'default'}
                          disabled={toggleAdmin.isPending}
                          onClick={() => toggleAdmin.mutate({
                            userId: p.id,
                            action: isCurrentAdmin ? 'revoke' : 'grant',
                          })}
                        >
                          {toggleAdmin.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isCurrentAdmin ? (
                            <><ShieldOff className="h-3 w-3 mr-1" />Hiq Admin</>
                          ) : (
                            <><ShieldCheck className="h-3 w-3 mr-1" />Bëj Admin</>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
