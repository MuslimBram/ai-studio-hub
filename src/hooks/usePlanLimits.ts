import { useMemo, useCallback } from "react";
import { useUserSubscription, useAiUsageToday, type Plan } from "./useSubscription";
import { useIsAdmin } from "./useAdmin";

export type AiCategory = "inbox" | "content" | "media" | "strategy" | "automation" | "general";
export type AiActionType = "reply" | "text_generation" | "image_generation" | "video_generation";

const AI_FEATURE_MAP: Record<string, string> = {
  inbox: "inbox_ai",
  content: "content_ai",
  media: "media_ai",
  strategy: "strategy_ai",
  automation: "automation_ai",
  general: "basic_reply",
};

function getLimitForAction(plan: Plan, actionType: AiActionType): number {
  switch (actionType) {
    case "reply": return plan.ai_replies_per_day;
    case "text_generation": return plan.ai_text_generations_per_day;
    case "image_generation": return plan.ai_image_generations_per_day;
    case "video_generation": return plan.ai_video_generations_per_day;
    default: return 0;
  }
}

export function usePlanLimits() {
  const { currentPlan, isFreePlan } = useUserSubscription();
  const { data: usageToday = [] } = useAiUsageToday();
  const { data: isAdmin = false } = useIsAdmin();

  const usageByAction = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of usageToday) {
      map[row.action_type] = (map[row.action_type] ?? 0) + row.usage_count;
    }
    return map;
  }, [usageToday]);

  const usageByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of usageToday) {
      map[row.category] = (map[row.category] ?? 0) + row.usage_count;
    }
    return map;
  }, [usageToday]);

  const getUsage = useCallback((actionType: AiActionType) => {
    if (isAdmin) return { used: 0, limit: -1, remaining: -1, isAtLimit: false };
    const used = usageByAction[actionType] ?? 0;
    const limit = getLimitForAction(currentPlan, actionType);
    return { used, limit, remaining: Math.max(0, limit - used), isAtLimit: used >= limit };
  }, [usageByAction, currentPlan, isAdmin]);

  const canUseAiFeature = useCallback((category: AiCategory): boolean => {
    if (isAdmin) return true;
    const featureKey = AI_FEATURE_MAP[category] ?? "basic_reply";
    return currentPlan.ai_features_enabled.includes(featureKey);
  }, [currentPlan, isAdmin]);

  const canPerformAction = useCallback((actionType: AiActionType, category: AiCategory = "general"): { allowed: boolean; reason?: string } => {
    if (isAdmin) return { allowed: true };
    if (!canUseAiFeature(category)) {
      return { allowed: false, reason: `Funksioni "${category}" nuk është i disponueshëm në planin tuaj ${currentPlan.name}. Përmirësoni planin.` };
    }
    const { isAtLimit, limit, used } = getUsage(actionType);
    if (isAtLimit) {
      return { allowed: false, reason: `Keni arritur limitin ditor: ${used}/${limit} ${actionType}. Provoni përsëri nesër ose përmirësoni planin.` };
    }
    return { allowed: true };
  }, [canUseAiFeature, getUsage, currentPlan, isAdmin]);

  const hasFeature = useCallback((feature: string): boolean => {
    if (isAdmin) return true;
    return currentPlan.features_enabled.includes(feature);
  }, [currentPlan, isAdmin]);

  return {
    currentPlan,
    isFreePlan: isAdmin ? false : isFreePlan,
    isAdmin,
    getUsage,
    canUseAiFeature,
    canPerformAction,
    hasFeature,
    usageByAction,
    usageByCategory,
    channelLimit: isAdmin ? -1 : currentPlan.max_channels,
  };
}
