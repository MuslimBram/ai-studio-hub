import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useDonationStats() {
  return useQuery({
    queryKey: ['donation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('amount, donor_name')
        .eq('status', 'completed');
      if (error) throw error;

      const totalAmount = (data || []).reduce((sum, d) => sum + Number(d.amount), 0);
      const totalCount = data?.length || 0;
      const recentDonors = (data || [])
        .filter(d => d.donor_name)
        .map(d => d.donor_name)
        .slice(0, 10);

      return { totalAmount, totalCount, recentDonors };
    },
    staleTime: 60 * 1000,
  });
}

export function useMyDonations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-donations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      amount: number;
      currency?: string;
      message?: string;
      donor_name?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: params,
      });
      if (error) throw error;
      return data as { orderId: string; approvalUrl: string };
    },
    onError: (error) => {
      toast({
        title: 'Gabim',
        description: 'Nuk u krijua porosia PayPal. Provo përsëri.',
        variant: 'destructive',
      });
    },
  });
}

export function useCaptureDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-donations'] });
      toast({
        title: 'Faleminderit! 🎉',
        description: 'Donacioni juaj u pranua me sukses. Ju falënderojmë për mbështetjen!',
      });
    },
    onError: () => {
      toast({
        title: 'Gabim',
        description: 'Pagesa nuk u konfirmua. Kontaktoni mbështetjen nëse çmimi u tërhoq.',
        variant: 'destructive',
      });
    },
  });
}
