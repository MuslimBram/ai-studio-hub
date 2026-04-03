import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAnalyticsSnapshots(accountId?: string, days = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics-snapshots", user?.id, accountId, days],
    queryFn: async () => {
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      let q = supabase
        .from("social_analytics_snapshots")
        .select("*")
        .gte("snapshot_date", from)
        .order("snapshot_date", { ascending: true });
      if (accountId) q = q.eq("social_account_id", accountId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function usePostMetrics(platform?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["post-metrics", user?.id, platform],
    queryFn: async () => {
      let q = supabase
        .from("social_post_metrics")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(100);
      if (platform) q = q.eq("platform", platform);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSocialReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-reports", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_reports")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (report: {
      title: string;
      report_type: string;
      platform_filter: string;
      date_from: string;
      date_to: string;
      summary_json: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from("social_reports")
        .insert({ ...report, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-reports"] }),
  });
}

export function useSocialTags() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-tags", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_tags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (tag: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from("social_tags")
        .insert({ ...tag, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social-tags"] }),
  });
}

export function useSocialInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-insights", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
