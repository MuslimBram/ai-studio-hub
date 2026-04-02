import { useMemo, useCallback } from "react";
import { useUserSubscription, useAiUsageToday, type Plan } from "./useSubscription";

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
    const used = usageByAction[actionType] ?? 0;
    const limit = getLimitForAction(currentPlan, actionType);
    return { used, limit, remaining: Math.max(0, limit - used), isAtLimit: used >= limit };
  }, [usageByAction, currentPlan]);

  const canUseAiFeature = useCallback((category: AiCategory): boolean => {
    const featureKey = AI_FEATURE_MAP[category] ?? "basic_reply";
    return currentPlan.ai_features_enabled.includes(featureKey);
  }, [currentPlan]);

  const canPerformAction = useCallback((actionType: AiActionType, category: AiCategory = "general"): { allowed: boolean; reason?: string } => {
    if (!canUseAiFeature(category)) {
      return { allowed: false, reason: `Funksioni "${category}" nuk është i disponueshëm në planin tuaj ${currentPlan.name}. Përmirësoni planin.` };
    }
    const { isAtLimit, limit, used } = getUsage(actionType);
    if (isAtLimit) {
      return { allowed: false, reason: `Keni arritur limitin ditor: ${used}/${limit} ${actionType}. Provoni përsëri nesër ose përmirësoni planin.` };
    }
    return { allowed: true };
  }, [canUseAiFeature, getUsage, currentPlan]);

  const hasFeature = useCallback((feature: string): boolean => {
    return currentPlan.features_enabled.includes(feature);
  }, [currentPlan]);

  return {
    currentPlan,
    isFreePlan,
    getUsage,
    canUseAiFeature,
    canPerformAction,
    hasFeature,
    usageByAction,
    usageByCategory,
    channelLimit: currentPlan.max_channels,
  };
}
