import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PlanUpgradePromptProps {
  reason: string;
  featureName?: string;
}

export function PlanUpgradePrompt({ reason, featureName }: PlanUpgradePromptProps) {
  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{featureName ? `${featureName} — Kërkohet përmirësim` : "Limit i arritur"}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">{reason}</p>
        <Button size="sm" variant="default" className="gap-1.5">
          Përmirëso Planin <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
