import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_channels: number;
  ai_replies_per_day: number;
  ai_text_generations_per_day: number;
  ai_image_generations_per_day: number;
  ai_video_generations_per_day: number;
  ai_features_enabled: string[];
  features_enabled: string[];
  is_active: boolean;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  plan?: Plan;
}

export interface AiUsageToday {
  category: string;
  action_type: string;
  usage_count: number;
}

const FREE_PLAN: Plan = {
  id: "plan-free",
  name: "Falas",
  slug: "free",
  description: "Për individë që duan të provojnë platformën",
  price_monthly: 0,
  price_yearly: 0,
  max_channels: 2,
  ai_replies_per_day: 10,
  ai_text_generations_per_day: 5,
  ai_image_generations_per_day: 0,
  ai_video_generations_per_day: 0,
  ai_features_enabled: ["basic_reply", "content_ai"],
  features_enabled: ["basic_tools", "basic_analytics"],
  is_active: true,
  display_order: 0,
};

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Plan[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useUserSubscription() {
  const { user } = useAuth();

  const subscriptionQuery = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as (UserSubscription & { plan: Plan }) | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const currentPlan: Plan = subscriptionQuery.data?.plan ?? FREE_PLAN;

  return {
    ...subscriptionQuery,
    currentPlan,
    subscription: subscriptionQuery.data,
    isFreePlan: currentPlan.slug === "free",
  };
}

export function useAiUsageToday() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-usage-today", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_ai_usage_today", {
        _user_id: user!.id,
      });
      if (error) throw error;
      return (data ?? []) as AiUsageToday[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // refresh every 30s
  });
}
