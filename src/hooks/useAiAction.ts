import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { AiCategory, AiActionType } from "./usePlanLimits";

interface AiActionParams {
  actionType: AiActionType;
  category: AiCategory;
}

/**
 * Hook to check AI usage limits before performing an AI action.
 * Call mutateAsync before making the actual AI call.
 * Returns { allowed, remaining, reason } from backend.
 */
export function useAiAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionType, category }: AiActionParams) => {
      const { data, error } = await supabase.functions.invoke("check-ai-usage", {
        body: { action_type: actionType, category },
      });
      if (error) throw error;
      return data as { allowed: boolean; reason?: string; used?: number; limit?: number; remaining?: number };
    },
    onSuccess: (data) => {
      // Invalidate usage cache so meters update
      queryClient.invalidateQueries({ queryKey: ["ai-usage-today"] });
      if (!data.allowed) {
        toast.error(data.reason || "Limiti i AI u arrit.");
      }
    },
    onError: (error) => {
      toast.error("Gabim në kontrollin e përdorimit AI: " + error.message);
    },
  });
}
