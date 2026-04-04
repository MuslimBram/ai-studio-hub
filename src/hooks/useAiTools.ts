import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AiTool {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  description: string;
  url: string;
  is_free: boolean;
  is_featured: boolean;
  logo_url: string;
  click_count: number;
  created_at: string;
}

export function useAiTools() {
  return useQuery({
    queryKey: ["ai-tools"],
    queryFn: async (): Promise<AiTool[]> => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("category")
        .order("subcategory")
        .order("is_featured", { ascending: false })
        .order("name");
      if (error) throw error;
      return (data || []) as AiTool[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrackToolClick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (toolId: string) => {
      // Increment click_count — requires admin, so we just log it client-side for now
      // Future: use an edge function for anonymous click tracking
      console.log("[analytics] tool_click", toolId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-tools"] });
    },
  });
}

export function useSubmitAiTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tool: {
      name: string;
      url: string;
      category: string;
      subcategory: string;
      description: string;
      is_free: boolean;
    }) => {
      const { error } = await supabase.from("ai_tools").insert({
        ...tool,
        is_featured: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-tools"] });
    },
  });
}
