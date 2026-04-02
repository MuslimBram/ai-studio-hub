import { usePlanLimits, type AiActionType } from "@/hooks/usePlanLimits";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Image, Video, MessageSquare, Lock } from "lucide-react";

const ACTION_LABELS: Record<AiActionType, { label: string; icon: React.ElementType }> = {
  reply: { label: "Përgjigje AI", icon: MessageSquare },
  text_generation: { label: "Gjenerim teksti", icon: Zap },
  image_generation: { label: "Gjenerim imazhi", icon: Image },
  video_generation: { label: "Gjenerim video", icon: Video },
};

interface AiUsageMeterProps {
  compact?: boolean;
}

export function AiUsageMeter({ compact = false }: AiUsageMeterProps) {
  const { getUsage, currentPlan } = usePlanLimits();

  const actions: AiActionType[] = ["reply", "text_generation", "image_generation", "video_generation"];

  if (compact) {
    const replies = getUsage("reply");
    const pct = replies.limit > 0 ? (replies.used / replies.limit) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        <span>{replies.remaining}/{replies.limit} AI</span>
        <Progress value={pct} className="h-1.5 w-16" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Përdorimi i AI Sot</h4>
        <Badge variant="outline" className="text-xs">{currentPlan.name}</Badge>
      </div>
      {actions.map((action) => {
        const { used, limit, remaining } = getUsage(action);
        const Icon = ACTION_LABELS[action].icon;
        const pct = limit > 0 ? (used / limit) * 100 : 0;
        const isLocked = limit === 0;

        return (
          <div key={action} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {isLocked ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Icon className="h-3 w-3" />}
                <span className={isLocked ? "text-muted-foreground" : ""}>{ACTION_LABELS[action].label}</span>
              </div>
              <span className={pct >= 90 ? "text-destructive font-medium" : "text-muted-foreground"}>
                {isLocked ? "I kyçur" : `${used}/${limit}`}
              </span>
            </div>
            {!isLocked && (
              <Progress value={pct} className={`h-1.5 ${pct >= 90 ? "[&>div]:bg-destructive" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
