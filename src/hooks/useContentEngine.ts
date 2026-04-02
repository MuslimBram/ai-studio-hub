import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSocialAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["social-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useScheduledPosts(status?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scheduled-posts", user?.id, status],
    queryFn: async () => {
      let q = supabase.from("scheduled_posts").select("*").order("scheduled_at", { ascending: true });
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function usePublishedPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["published-posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("published_posts")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useContentSuggestions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["content-suggestions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCompetitorData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["competitor-data", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitor_data")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateScheduledPost() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (post: {
      content: string;
      platform: string;
      scheduled_at: string;
      hashtags?: string[];
      media_urls?: string[];
      is_recurring?: boolean;
      recurrence_rule?: string;
      social_account_id?: string;
      ai_generated?: boolean;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .insert({ ...post, user_id: user!.id, status: post.status || "scheduled" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });
}

export function useUpdateScheduledPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });
}

export function useDeleteScheduledPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });
}

export function useAddCompetitor() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (comp: { competitor_name: string; competitor_url: string; platform: string }) => {
      const { data, error } = await supabase
        .from("competitor_data")
        .insert({ ...comp, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitor-data"] }),
  });
}

export function useGenerateContent() {
  return useMutation({
    mutationFn: async (params: {
      type: string;
      platform: string;
      tone?: string;
      keywords?: string[];
      businessDescription?: string;
      competitorContext?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-content", { body: params });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveContentSuggestion() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (suggestion: {
      suggestion_type: string;
      content: string;
      tone: string;
      keywords?: string[];
      platform: string;
      score?: number;
    }) => {
      const { data, error } = await supabase
        .from("content_suggestions")
        .insert({ ...suggestion, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["content-suggestions"] }),
  });
}
