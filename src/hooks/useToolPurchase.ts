import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useHasPurchased(toolId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tool-purchase', toolId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      // Query using raw select since tool_purchases may not be in generated types yet
      const { data, error } = await supabase
        .from('tool_purchases' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .eq('status', 'completed')
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!user && !!toolId,
    staleTime: 60 * 1000,
  });
}

export function useCreateToolPurchase() {
  return useMutation({
    mutationFn: async (params: { tool_id: string; return_url: string; cancel_url: string }) => {
      const { data, error } = await supabase.functions.invoke('create-tool-purchase', {
        body: params,
      });
      if (error) throw error;
      return data as { orderId: string; approvalUrl: string };
    },
    onError: (error: any) => {
      const msg = error?.message || '';
      if (msg.includes('already_purchased') || msg.includes('Already purchased')) {
        toast({ title: 'Tashmë e blerë', description: 'Ju keni akses te ky mjet.' });
      } else {
        toast({ title: 'Gabim', description: 'Nuk u krijua pagesa. Provo përsëri.', variant: 'destructive' });
      }
    },
  });
}

export function useCaptureToolPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('capture-tool-purchase', {
        body: { orderId },
      });
      if (error) throw error;
      return data as { success: boolean; tool_id: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tool-purchase'] });
      toast({ title: 'Sukses! 🎉', description: 'Pagesa u krye. Tani keni akses te mjeti.' });
    },
    onError: () => {
      toast({ title: 'Gabim', description: 'Pagesa nuk u konfirmua.', variant: 'destructive' });
    },
  });
}
